import { $kind, Entity } from './core';
import { Archetype, ArchetypeId } from './archetype';
import { Internals } from './internals';
import { $tag, Schema, KindToType } from './schema';
import { Query } from './query';
import { System } from './system';
import { Operation } from './operations';
import { safeGuard } from './switch';
import { Topic } from './topic';

/**
 * Essence is a container for Entities, Components and Archetypes.
 */
export type Essence = {
  // # State
  isFirstStep: boolean;
  state: 'running' | 'idle';

  // # Time
  currentStepTime: number;
  lastStepTime: number;

  // # Entity
  nextEntityId: number;
  entityGraveyard: number[];

  // # Archetypes
  archetypesById: Map<string, Archetype<any>>;

  // # Entity Archetype
  archetypeByEntity: Array<Archetype<any> | undefined>;

  // # Systems
  systems: {
    onFirstStep: System[];
    preUpdate: System[];
    update: System[];
    postUpdate: System[];
  };

  // # Queries
  queries: Query<any>[];

  // # Topics
  topics: Topic<unknown>[];

  // # Deferred Operations
  deferredOperations: {
    deferred: boolean;
    operations: Operation[];
    killed: Set<Entity>;
  };
};

// # Entity

export const spawnEntity = <SL extends Schema[]>(essence: Essence, arch?: Archetype<SL>) => {
  let entity: number;
  if (essence.entityGraveyard.length > 0) {
    entity = essence.entityGraveyard.pop()!;
  } else {
    entity = essence.nextEntityId++;
  }
  if (arch) {
    Archetype.addEntity(arch, entity);
    essence.archetypeByEntity[entity] = arch;
  }
  return entity;
};

export const killEntity = (essence: Essence, entity: number): void => {
  if (essence.deferredOperations.killed.has(entity)) {
    return;
  }

  if (essence.deferredOperations.deferred) {
    essence.deferredOperations.operations.push({
      type: 'killEntity',
      entityId: entity,
    });
    return;
  }

  essence.entityGraveyard.push(entity);

  const archetype = essence.archetypeByEntity[entity];
  if (archetype) {
    Archetype.removeEntity(archetype, entity);
  }
  essence.archetypeByEntity[entity] = undefined;
};

// # Archetype

export const createArchetype = <SL extends Schema[]>(
  essence: Essence,
  ...schemas: SL
): Archetype<SL> => {
  const archId = ArchetypeId.create(schemas);

  let archetype = essence.archetypesById.get(archId) as Archetype<SL> | undefined;

  if (archetype !== undefined) {
    return archetype;
  }

  // # Create new Archetype
  const newArchetype = Archetype.new(...schemas);

  // # Index new Archetype
  essence.archetypesById.set(newArchetype.id, newArchetype);

  // # Add to queries
  essence.queries.forEach((query) => {
    Query.tryAddArchetype(query, newArchetype);
  });

  return newArchetype;
};

export const registerArchetype = <SL extends Schema[]>(
  essence: Essence,
  newArchetype: Archetype<SL>
): Archetype<SL> => {
  const archId = ArchetypeId.create(newArchetype.type);

  let existingArchetype = essence.archetypesById.get(archId) as Archetype<SL> | undefined;

  if (existingArchetype !== undefined) {
    return existingArchetype;
  }

  // # Index new Archetype
  essence.archetypesById.set(newArchetype.id, newArchetype);

  // # Add to queries
  essence.queries.forEach((query) => {
    Query.tryAddArchetype(query, newArchetype);
  });

  return newArchetype;
};

export function addEntity<CL extends Schema[]>(
  essence: Essence,
  arch: Archetype<CL>,
  entity: Entity
): void {
  if (essence.deferredOperations.deferred) {
    essence.deferredOperations.operations.push({
      type: 'addEntity',
      entityId: entity,
      archetype: arch,
    });
    return;
  }

  Archetype.addEntity(arch, entity);
}

// OK
/**
 *
 * By setting component to Entity, we will find / create Archetype, that
 * will contain this Component Schema, move Entity and Components to this new
 * Archetype.
 *
 * @param essence
 * @param entity
 * @param schema
 * @param component
 * @returns
 */
export const setComponent = <S extends Schema>(
  essence: Essence,
  entity: Entity,
  schema: S,
  component?: S[typeof $kind] extends typeof $tag ? never : KindToType<S>
): void => {
  if (essence.deferredOperations.deferred) {
    essence.deferredOperations.operations.push({
      type: 'setComponent',
      entityId: entity,
      schema,
      component,
    });
    return;
  }

  const schemaId = Internals.getSchemaId(schema);

  // # Get current archetype
  let archetype = essence.archetypeByEntity[entity] as Archetype<any> | undefined;
  if (archetype === undefined) {
    // # If there were no archetype, create new one
    const newArchetype = Essence.createArchetype(essence, schema);

    // # Index archetype by entity
    essence.archetypeByEntity[entity] = newArchetype;

    // # Add entity to archetype
    Archetype.setComponent(newArchetype, entity, schemaId, component);

    return;
  }

  // # If Schema is already in archetype, than just set Component
  if (Archetype.hasSchema(archetype, schema)) {
    Archetype.setComponent(archetype, entity, schemaId, component);

    return;
  }

  // # If not, create new Archetype
  const newArchetype = Essence.createArchetype(
    essence,
    schema,
    ...archetype.type
  ) as unknown as Archetype<[S]>;

  // # Index archetype by entity
  essence.archetypeByEntity[entity] = newArchetype;

  // # Move Entity to new Archetype
  Archetype.moveEntity(archetype, newArchetype, entity);

  // # Add new data
  Archetype.setComponent(newArchetype, entity, schemaId, component);

  return;
};

// OK
/**
 *
 * By removing component from entity, we will find / create Archetype, that
 * will not contain this component, but will contain all other components from
 * current Archetype, and move entity and Components to this new Archetype.
 *
 * @param essence
 * @param entity
 * @param schema
 * @returns
 *
 * @example
 */
export const removeComponent = <S extends Schema>(
  essence: Essence,
  entity: Entity,
  schema: S
): void => {
  if (essence.deferredOperations.deferred) {
    essence.deferredOperations.operations.push({
      type: 'removeComponent',
      entityId: entity,
      schema,
    });
    return;
  }

  const schemaId = Internals.getSchemaId(schema);

  // # Get current archetype
  let archetype = essence.archetypeByEntity[entity] as Archetype<Schema[]> | undefined;
  if (archetype === undefined) {
    throw new Error(`Can't find archetype for entity ${entity}`);
  }

  // # Check if component in archetype
  if (!Archetype.hasSchema(archetype, schema)) {
    throw new Error(`Can't find component ${schemaId} on this archetype ${archetype.id}`);
  }

  // # Find or create new archetype
  const newArchetype = Essence.createArchetype(
    essence,
    ...archetype.type.filter((c) => c !== schema)
  );

  // # Index archetype by entity
  essence.archetypeByEntity[entity] = newArchetype;

  // # Move entity to new archetype
  Archetype.moveEntity(archetype, newArchetype, entity);

  return;
};

// # Queries

// TODO: add query index by id to check for similar filters
export function registerQuery<Q extends Query<Schema[]>>(essence: Essence, query: Q): Q {
  if (essence.queries.includes(query)) {
    return query;
  }

  essence.queries.push(query);

  essence.archetypesById.forEach((archetype) => {
    Query.tryAddArchetype(query, archetype);
  });

  return query;
}

export function applyDeferredOp(essence: Essence, operation: Operation): void {
  switch (operation.type) {
    case 'addEntity':
      addEntity(essence, operation.archetype, operation.entityId);
      break;
    case 'killEntity':
      killEntity(essence, operation.entityId);
      break;
    case 'setComponent':
      setComponent(essence, operation.entityId, operation.schema, operation.component);
      break;
    case 'removeComponent':
      removeComponent(essence, operation.entityId, operation.schema);
      break;
    default:
      return safeGuard(operation);
  }
}

export function registerSystem(
  essence: Essence,
  system: System,
  opts: {
    type?: 'onFirstStep' | 'preUpdate' | 'update' | 'postUpdate';
  } = {}
) {
  const type = opts.type;

  essence.systems[type || 'update'].push(system);
}

export function registerTopic<T extends Topic<unknown>>(essence: Essence, topic: T): T {
  if (essence.topics.includes(topic)) {
    return topic;
  }

  essence.topics.push(topic);

  return topic;
}

// TODO: think more about this
export function stepWithTicker(
  essence: Essence,
  ticker: {
    deltaTime: number;
    deltaMS: number;
    elapsedMS: number;
    lastTime: number;
    speed: number;
    started: boolean;
    FPS: number;
  }
): void {
  // # Set state
  essence.state = 'running';
  const now = performance.now();
  essence.currentStepTime = now;
  if (essence.lastStepTime === 0) {
    essence.lastStepTime = now;
  }

  // # Set delta
  const speed = ticker.speed;
  const deltaTime = ticker.deltaTime;
  const deltaMs = ticker.deltaMS;

  // # Execute deferred operations
  const operations = essence.deferredOperations.operations;

  for (let i = 0; i < operations.length; i++) {
    applyDeferredOp(essence, operations[i]);
  }

  essence.deferredOperations.operations = [];

  // # Flush topics
  for (let i = 0; i < essence.topics.length; i++) {
    Topic.flush(essence.topics[i]);
  }

  // # Execute systems
  essence.deferredOperations.deferred = true;

  if (essence.isFirstStep) {
    for (let i = 0, l = essence.systems.onFirstStep.length; i < l; i++) {
      const system = essence.systems.onFirstStep[i];
      system({
        stage: 'onFirstStep',
        essence,
        deltaTime,
        deltaMs,
        speed,
      });
    }
  }

  for (let i = 0, l = essence.systems.preUpdate.length; i < l; i++) {
    const system = essence.systems.preUpdate[i];
    system({
      essence,
      deltaTime,

      deltaMs,
      speed,
      stage: 'preUpdate',
    });
  }

  for (let i = 0, l = essence.systems.update.length; i < l; i++) {
    const system = essence.systems.update[i];
    system({
      essence,
      deltaTime,

      deltaMs,
      speed,
      stage: 'update',
    });
  }

  for (let i = 0, l = essence.systems.postUpdate.length; i < l; i++) {
    const system = essence.systems.postUpdate[i];
    system({
      essence,
      deltaTime,

      deltaMs,
      speed,
      stage: 'postUpdate',
    });
  }

  essence.deferredOperations.deferred = false;

  // # Reset killed
  essence.deferredOperations.killed.clear();

  // # Set state
  essence.lastStepTime = now;
  essence.state = 'idle';
  essence.isFirstStep = false;
}

export function step(essence: Essence): void {
  // # Set state
  essence.state = 'running';
  const now = Date.now();
  essence.currentStepTime = now;
  if (essence.lastStepTime === 0) {
    essence.lastStepTime = now;
  }

  // # Set delta
  let deltaMs = Math.max(0, now - essence.lastStepTime);
  let deltaTime = deltaMs * 0.06;

  // # Execute deferred operations
  const operations = essence.deferredOperations.operations;

  for (let i = 0; i < operations.length; i++) {
    applyDeferredOp(essence, operations[i]);
  }

  essence.deferredOperations.operations = [];

  // # Flush topics
  for (let i = 0; i < essence.topics.length; i++) {
    Topic.flush(essence.topics[i]);
  }

  // # Execute systems
  essence.deferredOperations.deferred = true;

  if (essence.isFirstStep) {
    for (let i = 0, l = essence.systems.onFirstStep.length; i < l; i++) {
      const system = essence.systems.onFirstStep[i];
      system({
        stage: 'onFirstStep',
        essence,
        deltaTime, // TODO: add this
        deltaMs,
        speed: 1, // TODO: add this
      });
    }
  }

  for (let i = 0, l = essence.systems.preUpdate.length; i < l; i++) {
    const system = essence.systems.preUpdate[i];
    system({
      essence,
      deltaTime,
      deltaMs,
      speed: 1, // TODO: add this
      stage: 'preUpdate',
    });
  }

  for (let i = 0, l = essence.systems.update.length; i < l; i++) {
    const system = essence.systems.update[i];
    system({
      essence,
      deltaTime,
      deltaMs,
      speed: 1, // TODO: add this
      stage: 'update',
    });
  }

  for (let i = 0, l = essence.systems.postUpdate.length; i < l; i++) {
    const system = essence.systems.postUpdate[i];
    system({
      essence,
      deltaTime,
      deltaMs,
      speed: 1, // TODO: add this
      stage: 'postUpdate',
    });
  }

  essence.deferredOperations.deferred = false;

  // # Reset killed
  essence.deferredOperations.killed.clear();

  // # Set state
  essence.lastStepTime = now;
  essence.state = 'idle';
  essence.isFirstStep = false;
}

export function newEssence(
  props: {
    queries?: Query<any>[];
    topics?: Topic<unknown>[];
    systems?: {
      onFirstStep?: System[];
      preUpdate?: System[];
      update?: System[];
      postUpdate?: System[];
    };
  } = {}
): Essence {
  return {
    isFirstStep: true,
    state: 'idle',
    currentStepTime: 0,
    lastStepTime: 0,
    nextEntityId: 1,
    entityGraveyard: [],
    archetypesById: new Map(),
    archetypeByEntity: [],
    systems: {
      onFirstStep: props.systems ? props.systems.onFirstStep ?? [] : [],
      preUpdate: props.systems ? props.systems.preUpdate ?? [] : [],
      update: props.systems ? props.systems.update ?? [] : [],
      postUpdate: props.systems ? props.systems.postUpdate ?? [] : [],
    },
    queries: props.queries ?? [],
    topics: props.topics ?? [],
    deferredOperations: {
      deferred: false,
      operations: [],
      killed: new Set(),
    },
  };
}

// MAYBE NOT REQUESTANIMATIONFRAME
export function run(essence: Essence): void {
  const frame = () => {
    step(essence);
    requestAnimationFrame(frame);
  };
  frame();
}

// OK
export const immediately = (essence: Essence, fn: () => void) => {
  essence.deferredOperations.deferred = false;
  fn();
  essence.deferredOperations.deferred = true;
};

// OK
export const registerSchema = Internals.registerSchema;

// OK
export const getSchemaId = Internals.getSchemaId;

// OK
export const archetypeByEntity = (essence: Essence, entity: Entity) =>
  essence.archetypeByEntity[entity];

// OK
export const hasComponent = <S extends Schema>(
  essence: Essence,
  entity: Entity,
  schema: S
): boolean => {
  const archetype = essence.archetypeByEntity[entity];
  if (!archetype) {
    return false;
  }

  return !!Archetype.hasSchema(archetype, schema);
};

// OK
export const componentByEntity = <S extends Schema>(
  essence: Essence,
  entity: Entity,
  schema: S
): KindToType<S> | undefined => {
  const archetype = essence.archetypeByEntity[entity];
  if (!archetype) {
    return;
  }

  if (!Archetype.hasSchema(archetype, schema)) {
    return;
  }

  if (!Archetype.hasEntity(archetype, entity)) {
    return;
  }

  return Archetype.component(archetype, entity, schema);
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Essence = {
  new: newEssence,
  archetypeByEntity,

  // # Entity
  spawnEntity,
  killEntity,
  hasComponent,
  componentByEntity,

  // # Components
  registerSchema,
  getSchemaId,

  // # Archetypes
  createArchetype,
  registerArchetype,

  // # Archetypes Entities & Components
  // ## Get
  table: Archetype.table,
  tablesList: Archetype.tablesList,
  component: Archetype.component,
  componentsList: Archetype.componentsList,

  // ## Set
  setComponent,
  removeComponent,

  // # System
  registerSystem,

  // # Query
  registerQuery,

  // # Topics
  registerTopic,

  // # Step
  step,
  immediately,
};

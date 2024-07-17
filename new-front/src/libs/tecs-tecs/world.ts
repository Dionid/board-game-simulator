import { Entity } from './core';
import { SparseSet } from './sparse-set';
import { Archetype, ArchetypeId, ArchetypeTable, ArchetypeTableRow } from './archetype';
import { Internals } from './internals';
import { Schema, SchemaType } from './schema';
import { ArrayContains } from './ts-types';
import { Query } from './query';
import { System } from './system';
import { Operation } from './operations';
import { safeGuard } from './switch';
import { Topic } from './topic';

/**
 * World is a container for Entities, Components and Archetypes.
 */
export type World = {
  // # State
  isFirstStep: boolean;
  state: 'running' | 'idle';

  // # Time
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

export const spawnEntity = <SL extends Schema[]>(world: World, arch?: Archetype<SL>) => {
  let entity: number;
  if (world.entityGraveyard.length > 0) {
    entity = world.entityGraveyard.pop()!;
  } else {
    entity = world.nextEntityId++;
  }
  if (arch) {
    Archetype.addEntity(arch, entity);
    world.archetypeByEntity[entity] = arch;
  }
  return entity;
};

export const killEntity = (world: World, entity: number): void => {
  if (world.deferredOperations.killed.has(entity)) {
    return;
  }

  if (world.deferredOperations.deferred) {
    world.deferredOperations.operations.push({
      type: 'killEntity',
      entityId: entity,
    });
    return;
  }

  world.entityGraveyard.push(entity);

  const archetype = world.archetypeByEntity[entity];
  if (archetype) {
    Archetype.removeEntity(archetype, entity);
  }
  world.archetypeByEntity[entity] = undefined;
};

// # Schema

export const registerSchema = (schema: Schema, schemaId?: number) => {
  return Internals.registerSchema(schema, schemaId);
};

export const getSchemaId = (schema: Schema) => {
  return Internals.getSchemaId(schema);
};

// # Archetype

export const registerArchetype = <SL extends Schema[]>(world: World, ...schemas: SL): Archetype<SL> => {
  const archId = ArchetypeId.create(schemas);

  let archetype = world.archetypesById.get(archId) as Archetype<SL> | undefined;

  if (archetype !== undefined) {
    return archetype;
  }

  // # Create new Archetype
  const ss = SparseSet.new();
  const newArchetype: Archetype<SL> = {
    id: archId,
    type: schemas,
    entitiesSS: ss,
    entities: ss.dense,
    table: schemas.reduce((acc, schema) => {
      acc[getSchemaId(schema)] = [];
      return acc;
    }, [] as ArchetypeTable<SL>),
  };

  // # Index new Archetype
  world.archetypesById.set(newArchetype.id, newArchetype);

  // # Add to queries
  world.queries.forEach((query) => {
    query.tryAdd(newArchetype);
  });

  return newArchetype;
};

export const archetypeTable = <S extends Schema, A extends Archetype<any>>(
  world: World,
  archetype: A,
  schema: A extends Archetype<infer iCL> ? (ArrayContains<iCL, [S]> extends true ? S : never) : never
) => {
  const componentId = World.getSchemaId(schema);
  return archetype.table[componentId] as ArchetypeTableRow<S>;
};

export const archetypeTablesList = <SL extends ReadonlyArray<Schema>, A extends Archetype<any>>(
  world: World,
  archetype: A,
  ...components: A extends Archetype<infer iCL> ? (ArrayContains<iCL, SL> extends true ? SL : never) : never
) => {
  return components.map((component) => {
    const componentId = World.getSchemaId(component);
    return archetype.table[componentId];
  }) as {
    [K in keyof SL]: SchemaType<SL[K]>[];
  };
};

export function addEntity<CL extends Schema[]>(world: World, arch: Archetype<CL>, entity: Entity): void {
  if (world.deferredOperations.deferred) {
    world.deferredOperations.operations.push({
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
 * @param world
 * @param entity
 * @param schema
 * @param component
 * @returns
 */
export const setComponent = <S extends Schema>(
  world: World,
  entity: Entity,
  schema: S,
  component?: SchemaType<S>
): void => {
  if (world.deferredOperations.deferred) {
    world.deferredOperations.operations.push({
      type: 'setComponent',
      entityId: entity,
      schema,
      component,
    });
    return;
  }

  const schemaId = World.getSchemaId(schema);

  // # Get current archetype
  let archetype = world.archetypeByEntity[entity] as Archetype<[S]> | undefined;
  if (archetype === undefined) {
    // # If there were no archetype, create new one
    const newArchetype = World.registerArchetype(world, schema);

    // # Index archetype by entity
    world.archetypeByEntity[entity] = newArchetype;

    // # Add entity to archetype
    Archetype.setComponent(newArchetype, entity, schemaId, component);

    return;
  }

  // # If Schema is already in archetype, than just set Component
  if (Archetype.isSchemaInArchetype(archetype, schemaId)) {
    Archetype.setComponent(archetype, entity, schemaId, component);

    return;
  }

  // # If not, create new Archetype
  const newArchetype = World.registerArchetype(world, schema, ...archetype.type) as unknown as Archetype<[S]>;

  // # Index archetype by entity
  world.archetypeByEntity[entity] = newArchetype;

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
 * @param world
 * @param entity
 * @param schema
 * @returns
 *
 * @example
 */
export const removeComponent = <S extends Schema>(world: World, entity: Entity, schema: S): void => {
  if (world.deferredOperations.deferred) {
    world.deferredOperations.operations.push({
      type: 'removeComponent',
      entityId: entity,
      schema,
    });
    return;
  }

  const schemaId = World.getSchemaId(schema);

  // # Get current archetype
  let archetype = world.archetypeByEntity[entity] as Archetype<[S]> | undefined;
  if (archetype === undefined) {
    throw new Error(`Can't find archetype for entity ${entity}`);
  }

  // # Check if component in archetype
  if (!Archetype.isSchemaInArchetype(archetype, schemaId)) {
    throw new Error(`Can't find component ${schemaId} on this archetype ${archetype.id}`);
  }

  // # Find or create new archetype
  const newArchetype = World.registerArchetype(world, ...archetype.type.filter((c) => c !== schema));

  // # Move entity to new archetype
  Archetype.moveEntity(archetype, newArchetype, entity);

  return;
};

// # Queries

export function registerQuery<SL extends ReadonlyArray<Schema>>(world: World, ...schemas: SL) {
  const query = Query.new(...schemas);

  world.queries.push(query);

  world.archetypesById.forEach((archetype) => {
    query.tryAdd(archetype);
  });

  return query;
}

export function applyDeferredOp(world: World, operation: Operation): void {
  switch (operation.type) {
    case 'addEntity':
      addEntity(world, operation.archetype, operation.entityId);
      break;
    case 'killEntity':
      killEntity(world, operation.entityId);
      break;
    case 'setComponent':
      setComponent(world, operation.entityId, operation.schema, operation.component);
      break;
    case 'removeComponent':
      removeComponent(world, operation.entityId, operation.schema);
      break;
    default:
      return safeGuard(operation);
  }
}

export function registerSystem(
  world: World,
  system: System,
  type?: 'onFirstStep' | 'preUpdate' | 'update' | 'postUpdate'
) {
  world.systems[type || 'update'].push(system);
}

export function registerTopic(world: World, topic: Topic<unknown>) {
  world.topics.push(topic);
}

export function step(world: World): void {
  // # Set state
  world.state = 'running';

  // # Set delta
  let deltaTime = world.lastStepTime - Date.now();

  if (deltaTime < 0) {
    deltaTime = 0;
  }

  // # Execute deferred operations
  const operations = world.deferredOperations.operations;

  for (let i = 0; i < operations.length; i++) {
    applyDeferredOp(world, operations[i]);
  }

  world.deferredOperations.operations = [];

  // # Flush topics
  for (let i = 0; i < world.topics.length; i++) {
    Topic.flush(world.topics[i]);
  }

  // # Execute systems
  world.deferredOperations.deferred = true;

  if (world.isFirstStep) {
    for (let i = 0, l = world.systems.onFirstStep.length; i < l; i++) {
      const system = world.systems.onFirstStep[i];
      system({
        stage: 'onFirstStep',
        world,
        deltaTime: deltaTime,
      });
    }
  }

  for (let i = 0, l = world.systems.preUpdate.length; i < l; i++) {
    const system = world.systems.preUpdate[i];
    system({
      world,
      deltaTime: deltaTime,
      stage: 'preUpdate',
    });
  }

  for (let i = 0, l = world.systems.update.length; i < l; i++) {
    const system = world.systems.update[i];
    system({
      world,
      deltaTime: deltaTime,
      stage: 'update',
    });
  }

  for (let i = 0, l = world.systems.postUpdate.length; i < l; i++) {
    const system = world.systems.postUpdate[i];
    system({
      world,
      deltaTime: deltaTime,
      stage: 'postUpdate',
    });
  }

  world.deferredOperations.deferred = false;

  // # Reset killed
  world.deferredOperations.killed.clear();

  // # Set state
  world.lastStepTime = deltaTime;
  world.state = 'idle';
  world.isFirstStep = false;
}

export function newWorld(): World {
  return {
    isFirstStep: true,
    state: 'idle',
    lastStepTime: 0,
    nextEntityId: 1,
    entityGraveyard: [],
    archetypesById: new Map(),
    archetypeByEntity: [],
    systems: {
      onFirstStep: [],
      preUpdate: [],
      update: [],
      postUpdate: [],
    },
    queries: [],
    topics: [],
    deferredOperations: {
      deferred: false,
      operations: [],
      killed: new Set(),
    },
  };
}

export const immediately = (world: World, fn: () => void) => {
  world.deferredOperations.deferred = false;
  fn();
  world.deferredOperations.deferred = true;
};

export const World = {
  new: newWorld,

  // # Entity
  spawnEntity,
  killEntity,

  // # Components
  registerSchema,
  getSchemaId,

  // # Archetypes
  registerArchetype,

  // # Archetypes Entities & Components
  // ## Get
  archetypeTable,
  archetypeTablesList,
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

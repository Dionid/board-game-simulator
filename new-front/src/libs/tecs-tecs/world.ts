import { Entity } from './core.js';
import { SparseSet } from './sparse-set.js';
import { Archetype, ArchetypeTable, ArchetypeTableRow } from './archetype.js';
import { Internals } from './internals.js';
import { Schema, SchemaType } from './schema.js';
import { ArrayContains } from './ts-types.js';
import { Query } from './query.js';
import { Handler } from './handler.js';

/**
 * World is a container for Entities, Components and Archetypes.
 */
export type World = {
  // # Entity
  nextEntityId: number;
  entityGraveyard: number[];

  // # Archetypes
  archetypesIdByArchetype: WeakMap<Archetype<any>, number>;
  archetypesById: Map<number, Archetype<any>>;
  archetypesByComponentsType: Map<string, Archetype<any>>;
  nextArchetypeId: number;

  // Entity Archetype
  archetypeByEntity: Map<Entity, Archetype<any> | undefined>;

  // Queries
  queries: Query<any>[];
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
    world.archetypeByEntity.set(entity, arch);
  }
  return entity;
};

export const killEntity = (world: World, entity: number) => {
  world.entityGraveyard.push(entity);

  const archetype = world.archetypeByEntity.get(entity);
  if (archetype) {
    Archetype.removeEntity(archetype, entity);
  }
  world.archetypeByEntity.set(entity, undefined);
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
  const type = schemas
    .map((component) => getSchemaId(component))
    .sort((a, b) => a - b)
    .join(',');

  let archetype = world.archetypesByComponentsType.get(type) as Archetype<SL> | undefined;

  if (archetype !== undefined) {
    return archetype;
  }

  // # Create new Archetype
  const ss = SparseSet.new();
  const newArchetype: Archetype<SL> = {
    id: world.nextArchetypeId++,
    type: schemas,
    entitiesSS: ss,
    entities: ss.dense,
    table: schemas.reduce((acc, component) => {
      acc[getSchemaId(component)] = [];
      return acc;
    }, [] as ArchetypeTable<SL>),
  };

  // # Index new Archetype
  world.archetypesByComponentsType.set(type, newArchetype);
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
): [Archetype<[S]>, SchemaType<S>] => {
  // # Fill props with default
  if (component === undefined) {
    component = Schema.default(schema);
  }

  const schemaId = World.getSchemaId(schema);

  // # Get current archetype
  let archetype = world.archetypeByEntity.get(entity) as Archetype<[S]> | undefined;
  if (archetype === undefined) {
    // # If there were no archetype, create new one
    const newArchetype = World.registerArchetype(world, schema);

    // # Index archetype by entity
    world.archetypeByEntity.set(entity, newArchetype);

    // # Add entity to archetype
    Archetype.setComponent(newArchetype, entity, schemaId, component);

    return [newArchetype, component];
  }

  // # If Schema is already in archetype, than just set Component
  if (Archetype.isSchemaInArchetype(archetype, schemaId)) {
    Archetype.setComponent(archetype, entity, schemaId, component);

    return [archetype, component];
  }

  // # If not, create new Archetype
  const newArchetype = World.registerArchetype(world, schema, ...archetype.type) as unknown as Archetype<[S]>;

  // # Index archetype by entity
  world.archetypeByEntity.set(entity, newArchetype);

  // # Move Entity to new Archetype
  Archetype.moveEntity(archetype, newArchetype, entity);

  // # Add new data
  Archetype.setComponent(newArchetype, entity, schemaId, component);

  return [newArchetype, component];
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
export const removeComponent = <S extends Schema>(world: World, entity: Entity, schema: S) => {
  const schemaId = World.getSchemaId(schema);

  // # Get current archetype
  let archetype = world.archetypeByEntity.get(entity) as Archetype<[S]> | undefined;
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

  return newArchetype;
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

export function step(world: World, systems: Handler[]) {
  for (let i = 0; i < systems.length; i++) {
    const system = systems[i];
    system({
      world,
      event: {
        type: 'update',
      },
    });
  }
}

export const World = {
  new: (): World => ({
    nextEntityId: 1,
    entityGraveyard: [],

    archetypesIdByArchetype: new WeakMap(),
    archetypesByComponentsType: new Map(),
    archetypesById: new Map(),
    nextArchetypeId: 0,
    archetypeByEntity: new Map(),

    queries: [],
  }),

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

  // # Query
  registerQuery,

  // # Step
  step,
};

import { Entity } from './core';
import { SparseSet } from './sparse-set';
import { Archetype, ArchetypeTable, ArchetypeTableRow } from './archetype';
import { Internals } from './internals';
import { Schema, SchemaType, defaultFn } from './schema';
import { ArrayContains } from './ts-types';

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
  archetypeByEntity: Map<Entity, Archetype<any>>;
};

// # Entity

export const spawnEntity = (world: World) => {
  let entity: number;
  if (world.entityGraveyard.length > 0) {
    entity = world.entityGraveyard.pop()!;
  } else {
    entity = world.nextEntityId++;
  }
  return entity;
};

export const killEntity = (world: World, entity: number) => {
  world.entityGraveyard.push(entity);
};

// # Schema

export const registerSchema = (world: World, schema: Schema, schemaId?: number) => {
  return Internals.registerSchema(world, schema, schemaId);
};

export const getSchemaId = (world: World, schema: Schema) => {
  return Internals.getSchemaId(world, schema);
};

// # Archetype

export const registerArchetype = <SL extends Schema[]>(world: World, ...schemas: SL): Archetype<SL> => {
  const type = schemas
    .map((component) => World.getSchemaId(world, component))
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
      acc[World.getSchemaId(world, component)] = [];
      return acc;
    }, [] as ArchetypeTable<SL>),
  };

  // # Index new Archetype
  world.archetypesByComponentsType.set(type, newArchetype);
  world.archetypesById.set(newArchetype.id, newArchetype);

  return newArchetype;
};

export const archetypeTable = <S extends Schema, A extends Archetype<any>>(
  world: World,
  archetype: A,
  schema: A extends Archetype<infer iCL> ? (ArrayContains<iCL, [S]> extends true ? S : never) : never
) => {
  const componentId = World.getSchemaId(world, schema);
  return archetype.table[componentId] as ArchetypeTableRow<S>;
};

export const archetypeTablesList = <SL extends ReadonlyArray<Schema>, A extends Archetype<any>>(
  world: World,
  archetype: A,
  ...components: A extends Archetype<infer iCL> ? (ArrayContains<iCL, SL> extends true ? SL : never) : never
) => {
  return components.map((component) => {
    const componentId = World.getSchemaId(world, component);
    return archetype.table[componentId];
  }) as {
    [K in keyof SL]: SchemaType<SL[K]>[];
  };
};

export const componentByArchetype = <S extends Schema, A extends Archetype<any>>(
  world: World,
  archetype: A,
  entity: Entity,
  component: A extends Archetype<infer iCL> ? (ArrayContains<iCL, [S]> extends true ? S : never) : never
) => {
  const componentId = World.getSchemaId(world, component);
  const componentIndex = archetype.entitiesSS.sparse[entity];
  return archetype.table[componentId][componentIndex] as SchemaType<S>;
};

export const componentsListByArchetype = <SL extends ReadonlyArray<Schema>, A extends Archetype<any>>(
  world: World,
  archetype: A,
  entity: Entity,
  ...schemas: A extends Archetype<infer iCL> ? (ArrayContains<iCL, SL> extends true ? SL : never) : never
) => {
  return schemas.map((component) => {
    const schemaId = World.getSchemaId(world, component);
    const schemaIndex = archetype.entitiesSS.sparse[entity];
    return archetype.table[schemaId][schemaIndex];
  }) as {
    [K in keyof SL]: SchemaType<SL[K]>;
  };
};

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
export const setComponent = <S extends Schema>(world: World, entity: Entity, schema: S, component?: SchemaType<S>) => {
  // # Fill props with default
  if (component === undefined) {
    component = {} as SchemaType<S>;
    // TODO: How to add tags
    // TODO: Add recursive default props
    for (const key in schema) {
      const sss = schema[key];
      if (defaultFn in sss) {
        component[key] = sss[defaultFn]() as any;
      }
    }
  }

  const schemaId = World.getSchemaId(world, schema);

  // # Get current archetype
  let archetype = world.archetypeByEntity.get(entity) as Archetype<[S]> | undefined;
  if (archetype === undefined) {
    // # If there were no archetype, create new one
    const newArchetype = World.registerArchetype(world, schema);

    // # Index archetype by entity
    world.archetypeByEntity.set(entity, newArchetype);

    // # Add entity to archetype
    Archetype.setComponent(newArchetype, entity, schemaId, component);

    return [archetype, component];
  }

  // # If Schema is already in archetype, than just set Component
  if (Archetype.isSchemaInArchetype(archetype, schemaId)) {
    Archetype.setComponent(archetype, entity, schemaId, component);

    return [archetype, component];
  }

  // # If not, create new Archetype
  const newArchetype = World.registerArchetype(world, schema, ...archetype.type);

  // # Index archetype by entity
  world.archetypeByEntity.set(entity, newArchetype);

  // # Move Entity to new Archetype
  const componentsList = Archetype.removeEntity(archetype, entity);
  for (const component of componentsList) {
    const schemaId = World.getSchemaId(world, schema);
    Archetype.setComponent(newArchetype, entity, schemaId, component);
  }

  return [newArchetype, component];
};

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
  const schemaId = World.getSchemaId(world, schema);

  // # Get current archetype
  let archetype = world.archetypeByEntity.get(entity) as Archetype<[S]> | undefined;
  if (archetype === undefined) {
    throw new Error(`Can't find archetype for entity ${entity}`);
  }

  // # Check if component in archetype
  if (!Archetype.isSchemaInArchetype(archetype, schemaId)) {
    throw new Error(`Can't find component ${schemaId} on this archetype ${archetype.id}`);
  }

  // # Remove component from archetype
  const componentsList = Archetype.removeEntity(archetype, entity);

  // # Find or create new archetype
  const newArchetype = World.registerArchetype(world, ...archetype.type.filter((c) => c !== schema));

  for (const component of componentsList) {
    const schemaId = World.getSchemaId(world, schema);
    Archetype.setComponent(newArchetype, entity, schemaId, component);
  }

  return newArchetype;
};

export const World = {
  new: (): World => ({
    nextEntityId: 0,
    entityGraveyard: [],

    archetypesIdByArchetype: new WeakMap(),
    archetypesByComponentsType: new Map(),
    archetypesById: new Map(),
    nextArchetypeId: 0,

    archetypeByEntity: new Map(),
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
  componentByArchetype,
  componentsListByArchetype,

  // ## Set
  setComponent,
  removeComponent,
};

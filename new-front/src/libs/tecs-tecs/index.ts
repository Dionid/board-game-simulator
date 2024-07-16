import { defaultFn, SchemaType, Schema } from './schema';
import { SparseSet } from './sparse-set';
import { ArrayContains } from './ts-types';

// # Entity

export type Entity = number;

// # Id

export type Id = number;

// # Component

export type SchemaId = Id;

// # Internals

export type Internals = {
  // # Worlds
  worlds: World[];
  currentWorldId: number;
  worldIds: number;

  // # Components
  schemaIdBySchema: WeakMap<Schema, number>;
  schemaById: Map<number, Schema>;
  nextSchemaId: number;
};

export const UNSAFE_internals: Internals = {
  // # Worlds
  worlds: [],
  currentWorldId: -1,
  worldIds: 0,

  // # Schema
  schemaIdBySchema: new WeakMap(),
  schemaById: new Map(),
  nextSchemaId: 0,
};

export const Internals = {
  registerSchema: (world: World, schema: Schema, schemaId?: SchemaId) => {
    let type: number | undefined = UNSAFE_internals.schemaIdBySchema.get(schema);
    if (type !== undefined) {
      return type;
    }
    type = schemaId;
    if (type === undefined) {
      while (UNSAFE_internals.schemaById.has(UNSAFE_internals.nextSchemaId)) {
        UNSAFE_internals.nextSchemaId++;
      }
      type = UNSAFE_internals.nextSchemaId;
    } else if (UNSAFE_internals.schemaById.has(type)) {
      throw new Error('Failed to register component type: a component with same id is already registered');
    }
    UNSAFE_internals.schemaById.set(type, schema);
    UNSAFE_internals.schemaIdBySchema.set(schema, type);

    // # Create Archetype
    World.registerArchetype(world, schema);

    return type;
  },
  getSchemaId: (world: World, schema: Schema) => {
    let type = UNSAFE_internals.schemaIdBySchema.get(schema);
    if (type === undefined) {
      type = Internals.registerSchema(world, schema);
    }
    return type;
  },
};

// # Archetype

export type ArchetypeTableRow<S extends Schema> = SchemaType<S>[];

export type ArchetypeTable<SL extends ReadonlyArray<Schema>> = {
  [K in keyof SL]: ArchetypeTableRow<SL[K]>;
};

export type Archetype<SL extends ReadonlyArray<Schema> = ReadonlyArray<Schema>> = {
  id: number;
  type: SL;
  entitiesSS: SparseSet;
  entities: number[]; // dense
  table: ArchetypeTable<SL>;
};

export const Archetype = {
  hasSchema: (arch: Archetype<any>, schemaId: SchemaId) => {
    return arch.table[schemaId] !== undefined;
  },
  hasEntity: (arch: Archetype<any>, entity: Entity) => {
    return SparseSet.has(arch.entitiesSS, entity);
  },
  setComponent: <C extends Schema>(arch: Archetype<any>, entity: Entity, schemaId: SchemaId, props: SchemaType<C>) => {
    // # Add component to archetype
    const componentTable = arch.table[schemaId];

    if (!componentTable) {
      throw new Error(`Can't find component ${schemaId} on this archetype ${arch.id}`);
    }

    const sSet = arch.entitiesSS;

    const denseInd = sSet.sparse[entity] as number | undefined;
    if (
      entity >= sSet.sparse.length ||
      denseInd === undefined ||
      denseInd >= sSet.dense.length ||
      sSet.dense[denseInd] !== entity
    ) {
      sSet.sparse[entity] = sSet.dense.length;
      sSet.dense.push(entity);
      componentTable.push(props);
      return true;
    }

    if (
      entity < sSet.sparse.length &&
      denseInd !== undefined &&
      denseInd < sSet.dense.length &&
      sSet.dense[denseInd] === entity
    ) {
      componentTable[denseInd] = props;
      return true;
    }

    return false;
  },
  removeEntity: <CL extends Schema[]>(
    arch: Archetype<CL>,
    entity: Entity
  ): {
    [K in keyof CL]: SchemaType<CL[K]>;
  } => {
    // # Remove entity and component to archetype
    const sSet = arch.entitiesSS;

    const componentsData = [] as {
      [K in keyof CL]: SchemaType<CL[K]>;
    };

    const denseInd = sSet.sparse[entity];
    if (sSet.dense[denseInd] === entity && sSet.dense.length > 0) {
      const swapEntity = sSet.dense.pop()!;

      for (const componentTable of arch.table) {
        componentsData.push(componentTable[denseInd] as SchemaType<CL[number]>);
        const component = componentTable.pop()!;
        if (swapEntity !== entity) {
          componentTable[denseInd] = component;
        }
      }
      if (swapEntity !== entity) {
        sSet.dense[denseInd] = swapEntity;
        sSet.sparse[swapEntity] = denseInd;
      }
    }

    return componentsData;
  },
};

// # Handler

export type EventType = string;

export type Event = {
  type: EventType;
};

export type Context = {
  event: Event;
  world: World;
};

export type Handler = (ctx: Context) => void;

// # World

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
  spawnEntity: (world: World) => {
    let entity: number;
    if (world.entityGraveyard.length > 0) {
      entity = world.entityGraveyard.pop()!;
    } else {
      entity = world.nextEntityId++;
    }
    return entity;
  },

  killEntity: (world: World, entity: number) => {
    world.entityGraveyard.push(entity);
  },

  // # Components
  registerComponent: (world: World, schema: Schema, schemaId?: number) => {
    return Internals.registerSchema(world, schema, schemaId);
  },

  getSchemaId: (world: World, schema: Schema) => {
    return Internals.getSchemaId(world, schema);
  },

  // # Archetypes
  registerArchetype: <SL extends Schema[]>(world: World, ...schemas: SL): Archetype<SL> => {
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
  },

  // # Archetypes Entities & Components
  // ## Get
  archetypeTable: <S extends Schema, A extends Archetype<any>>(
    world: World,
    archetype: A,
    schema: A extends Archetype<infer iCL> ? (ArrayContains<iCL, [S]> extends true ? S : never) : never
  ) => {
    const componentId = World.getSchemaId(world, schema);
    return archetype.table[componentId] as ArchetypeTableRow<S>;
  },

  archetypeTablesList: <SL extends ReadonlyArray<Schema>, A extends Archetype<any>>(
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
  },

  componentByArchetype: <S extends Schema, A extends Archetype<any>>(
    world: World,
    archetype: A,
    entity: Entity,
    component: A extends Archetype<infer iCL> ? (ArrayContains<iCL, [S]> extends true ? S : never) : never
  ) => {
    const componentId = World.getSchemaId(world, component);
    const componentIndex = archetype.entitiesSS.sparse[entity];
    return archetype.table[componentId][componentIndex] as SchemaType<S>;
  },

  componentsListByArchetype: <SL extends ReadonlyArray<Schema>, A extends Archetype<any>>(
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
  },

  // ## Set
  setComponent: <S extends Schema>(world: World, entity: Entity, schema: S, component?: SchemaType<S>) => {
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
    let archetype = world.archetypeByEntity.get(entity);
    if (archetype === undefined) {
      // # If there were no archetype, create new one
      const newArchetype = World.registerArchetype(world, schema);

      // # Index archetype by entity
      world.archetypeByEntity.set(entity, newArchetype);

      // # Add entity to archetype
      Archetype.setComponent(newArchetype, entity, schemaId, component);

      return [archetype, component];
    }

    // # Check if component is already in archetype
    if (Archetype.hasSchema(archetype, schemaId)) {
      Archetype.setComponent(archetype, entity, schemaId, component);

      return [archetype, component];
    }

    // # Create new archetype
    const newArchetype = World.registerArchetype(world, schema, ...archetype.type);

    // # Index archetype by entity
    world.archetypeByEntity.set(entity, newArchetype);

    // # Move entity to new archetype
    Archetype.setComponent(newArchetype, entity, schemaId, component);

    return [newArchetype, component];
  },

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
  removeComponent: <S extends Schema>(world: World, entity: Entity, schema: S) => {
    const schemaId = World.getSchemaId(world, schema);

    // # Get current archetype
    let archetype = world.archetypeByEntity.get(entity) as Archetype<[S]> | undefined;
    if (archetype === undefined) {
      throw new Error(`Can't find archetype for entity ${entity}`);
    }

    // # Check if component in archetype
    if (!Archetype.hasSchema(archetype, schemaId)) {
      throw new Error(`Can't find component ${schemaId} on this archetype ${archetype.id}`);
    }

    // # Remove component from archetype
    const componentsList = Archetype.removeEntity(archetype, entity);
    if (!componentsList) {
      throw new Error(`Can't find component ${schemaId} on this archetype ${archetype.id}`);
    }

    // # Find or create new archetype
    const newArchetype = World.registerArchetype(world, ...archetype.type.filter((c) => c !== schema));

    for (const component of componentsList) {
      const schemaId = World.getSchemaId(world, schema);
      Archetype.setComponent(newArchetype, entity, schemaId, component);
    }

    return newArchetype;
  },
};

import { defaultFn, ExtractSchemaType, Schema } from './schema';
import { SparseSet } from './sparse-set';
import { ArrayContains } from './ts-types';

// # Entity

export type Entity = number;

// # Id

export type Id = number;

// # Component

export type ComponentId = Id;
export type Component = Schema;
export type ComponentType<C> = ExtractSchemaType<C>;

// # Internals

export type Internals = {
  // # Worlds
  worlds: World[];
  currentWorldId: number;
  worldIds: number;

  // # Components
  componentIdByComponent: WeakMap<Component, number>;
  componentById: Map<number, Component>;
  nextComponentId: number;
};

export const UNSAFE_internals: Internals = {
  // # Worlds
  worlds: [],
  currentWorldId: -1,
  worldIds: 0,

  // # Components
  componentIdByComponent: new WeakMap(),
  componentById: new Map(),
  nextComponentId: 0,
};

export const Internals = {
  registerComponent: (world: World, component: Component, componentId?: ComponentId) => {
    let type: number | undefined = UNSAFE_internals.componentIdByComponent.get(component);
    if (type !== undefined) {
      return type;
    }
    type = componentId;
    if (type === undefined) {
      while (UNSAFE_internals.componentById.has(UNSAFE_internals.nextComponentId)) {
        UNSAFE_internals.nextComponentId++;
      }
      type = UNSAFE_internals.nextComponentId;
    } else if (UNSAFE_internals.componentById.has(type)) {
      throw new Error('Failed to register component type: a component with same id is already registered');
    }
    UNSAFE_internals.componentById.set(type, component);
    UNSAFE_internals.componentIdByComponent.set(component, type);

    // # Create Archetype
    World.registerArchetype(world, component);

    return type;
  },
  getComponentId: (world: World, schema: Component) => {
    let type = UNSAFE_internals.componentIdByComponent.get(schema);
    if (type === undefined) {
      type = Internals.registerComponent(world, schema);
    }
    return type;
  },
};

// # Archetype

export type ArchetypeTableRow<C extends Component> = ComponentType<C>[];

export type ArchetypeTable<CL extends ReadonlyArray<Component>> = {
  [K in keyof CL]: ArchetypeTableRow<CL[K]>;
};

export type Archetype<CL extends ReadonlyArray<Component> = ReadonlyArray<Component>> = {
  id: number;
  type: CL;
  entitiesSS: SparseSet;
  entities: number[]; // dense
  table: ArchetypeTable<CL>;
};

export const Archetype = {
  hasComponent: (arch: Archetype<any>, componentId: ComponentId) => {
    return arch.table[componentId] !== undefined;
  },
  hasEntity: (arch: Archetype<any>, entity: Entity) => {
    return SparseSet.has(arch.entitiesSS, entity);
  },
  setComponent: <C extends Component>(
    arch: Archetype<any>,
    entity: Entity,
    componentId: ComponentId,
    props: ComponentType<C>
  ) => {
    // # Add component to archetype
    const componentTable = arch.table[componentId];

    if (!componentTable) {
      throw new Error(`Can't find component ${componentId} on this archetype ${arch.id}`);
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
  removeComponent: (
    arch: Archetype<any>,
    entity: Entity,
    componentId: ComponentId
  ): ComponentType<Component> | null => {
    // # Add component props to archetype
    const componentTable = arch.table[componentId] as ArchetypeTableRow<Component>;

    if (!componentTable) {
      throw new Error(`Can't find component ${componentId} on this archetype ${arch.id}`);
    }

    // # Remove entity and component to archetype
    const sSet = arch.entitiesSS;

    const denseInd = sSet.sparse[entity];
    if (sSet.dense[denseInd] === entity && sSet.dense.length > 0) {
      const swapEntity = sSet.dense.pop()!;
      const component = componentTable.pop()!;
      if (swapEntity !== entity) {
        sSet.dense[denseInd] = swapEntity;
        componentTable[denseInd] = component;
        sSet.sparse[swapEntity] = denseInd;
      }
      return component;
    }

    return null;
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
  registerComponent: (world: World, component: Component, componentId?: number) => {
    return Internals.registerComponent(world, component, componentId);
  },

  getComponentId: (world: World, schema: Component) => {
    return Internals.getComponentId(world, schema);
  },

  // # Archetypes
  registerArchetype: <CL extends Component[]>(world: World, ...components: CL): Archetype<CL> => {
    const type = components
      .map((component) => World.getComponentId(world, component))
      .sort((a, b) => a - b)
      .join(',');

    let archetype = world.archetypesByComponentsType.get(type) as Archetype<CL> | undefined;

    if (archetype !== undefined) {
      return archetype;
    }

    // # Create new Archetype
    const ss = SparseSet.new();
    const newArchetype: Archetype<CL> = {
      id: world.nextArchetypeId++,
      type: components,
      entitiesSS: ss,
      entities: ss.dense,
      table: components.reduce((acc, component) => {
        acc[World.getComponentId(world, component)] = [];
        return acc;
      }, [] as ArchetypeTable<CL>),
    };

    // # Index new Archetype
    world.archetypesByComponentsType.set(type, newArchetype);
    world.archetypesById.set(newArchetype.id, newArchetype);

    return newArchetype;
  },

  // # Archetypes Entities & Components
  // ## Get
  archetypeTable: <C extends Component, A extends Archetype<any>>(
    world: World,
    archetype: A,
    component: A extends Archetype<infer iCL> ? (ArrayContains<iCL, [C]> extends true ? C : never) : never
  ) => {
    const componentId = World.getComponentId(world, component);
    return archetype.table[componentId] as ArchetypeTableRow<C>;
  },

  archetypeTablesList: <CL extends ReadonlyArray<Component>, A extends Archetype<any>>(
    world: World,
    archetype: A,
    ...components: A extends Archetype<infer iCL> ? (ArrayContains<iCL, CL> extends true ? CL : never) : never
  ) => {
    return components.map((component) => {
      const componentId = World.getComponentId(world, component);
      return archetype.table[componentId];
    }) as {
      [K in keyof CL]: ComponentType<CL[K]>[];
    };
  },

  componentByArchetype: <C extends Component, A extends Archetype<any>>(
    world: World,
    archetype: A,
    entity: Entity,
    component: A extends Archetype<infer iCL> ? (ArrayContains<iCL, [C]> extends true ? C : never) : never
  ) => {
    const componentId = World.getComponentId(world, component);
    const componentIndex = archetype.entitiesSS.sparse[entity];
    return archetype.table[componentId][componentIndex] as ComponentType<C>;
  },

  componentsListByArchetype: <CL extends ReadonlyArray<Component>, A extends Archetype<any>>(
    world: World,
    archetype: A,
    entity: Entity,
    ...components: A extends Archetype<infer iCL> ? (ArrayContains<iCL, CL> extends true ? CL : never) : never
  ) => {
    return components.map((component) => {
      const componentId = World.getComponentId(world, component);
      const componentIndex = archetype.entitiesSS.sparse[entity];
      return archetype.table[componentId][componentIndex];
    }) as {
      [K in keyof CL]: ComponentType<CL[K]>;
    };
  },

  // ## Set
  setComponent: <C extends Component>(world: World, entity: Entity, component: C, props?: ComponentType<C>) => {
    // # Fill props with default
    if (props === undefined) {
      props = {} as ComponentType<C>;
      // TODO: How to add tags
      // TODO: Add recursive default props
      for (const key in component) {
        const sss = component[key];
        if (defaultFn in sss) {
          props[key] = sss[defaultFn]() as any;
        }
      }
    }

    const componentId = World.getComponentId(world, component);

    // # Get current archetype
    let archetype = world.archetypeByEntity.get(entity);
    if (archetype === undefined) {
      // # If there were no archetype, create new one
      const newArchetype = World.registerArchetype(world, component);

      // # Index archetype by entity
      world.archetypeByEntity.set(entity, newArchetype);

      // # Add entity to archetype
      Archetype.setComponent(newArchetype, entity, componentId, props);

      return [archetype, props];
    }

    // # Check if component is already in archetype
    if (Archetype.hasComponent(archetype, componentId)) {
      Archetype.setComponent(archetype, entity, componentId, props);

      return [archetype, props];
    }

    // # Create new archetype
    const newArchetype = World.registerArchetype(world, component, ...archetype.type);

    // # Index archetype by entity
    world.archetypeByEntity.set(entity, newArchetype);

    // # Move entity to new archetype
    Archetype.setComponent(newArchetype, entity, componentId, props);

    return [newArchetype, props];
  },

  // ## Remove
  removeComponent: <C extends Component>(world: World, entity: Entity, component: C) => {
    const componentId = World.getComponentId(world, component);

    // # Get current archetype
    let archetype = world.archetypeByEntity.get(entity) as Archetype<[C]> | undefined;
    if (archetype === undefined) {
      throw new Error(`Can't find archetype for entity ${entity}`);
    }

    // # Check if component in archetype
    if (!Archetype.hasComponent(archetype, componentId)) {
      throw new Error(`Can't find component ${componentId} on this archetype ${archetype.id}`);
    }

    // # Remove component from archetype
    const componentData = Archetype.removeComponent(archetype, entity, componentId);
    if (!componentData) {
      throw new Error(`Can't find component ${componentId} on this archetype ${archetype.id}`);
    }

    // # Find new archetype
    const newArchetype = World.registerArchetype(world, ...archetype.type.filter((c) => c !== component));

    Archetype.setComponent(newArchetype, entity, componentId, componentData);

    return newArchetype;
  },
};

import { defaultFn, ExtractSchemaType, Schema } from './schema';
import { SparseSet } from './sparse-set';
import { ArrayContains } from './ts-types';

// # Entity

export type Entity = number;

// # Component

export type Component = Schema;
export type ComponentTypes<C> = ExtractSchemaType<C>;

// # Archetype

export type ArchetypeTableRow<C extends Component> = ComponentTypes<C>[];

export type ArchetypeTable<CL extends ReadonlyArray<Component>> = {
  [K in keyof CL]: ArchetypeTableRow<CL[K]>;
};

export type Archetype<CL extends ReadonlyArray<Component>> = {
  id: number;
  type: CL;
  entitiesSS: SparseSet<Entity>;
  entities: number[]; // dense
  table: ArchetypeTable<CL>;
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

  // # Components
  componentIdByComponent: WeakMap<Component, number>;
  componentById: Map<number, Component>;
  nextComponentId: number;

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

    componentIdByComponent: new WeakMap(),
    componentById: new Map(),
    nextComponentId: 0,

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
    let type: number | undefined = world.componentIdByComponent.get(component);
    if (type !== undefined) {
      return type;
    }
    type = componentId;
    if (type === undefined) {
      while (world.componentById.has(world.nextComponentId)) {
        world.nextComponentId++;
      }
      type = world.nextComponentId;
    } else if (world.componentById.has(type)) {
      throw new Error('Failed to register component type: a component with same id is already registered');
    }
    world.componentById.set(type, component);
    world.componentIdByComponent.set(component, type);

    // # Create Archetype
    World.registerArchetype(world, component);

    return type;
  },

  getComponentId: (world: World, schema: Component) => {
    let type = world.componentIdByComponent.get(schema);
    if (type === undefined) {
      type = World.registerComponent(world, schema);
    }
    return type;
  },

  // # Archetypes
  registerArchetype: <CL extends Component[]>(world: World, ...components: CL): Archetype<CL> => {
    const type = components
      .map((component) => World.getComponentId(world, component))
      .sort((a, b) => a - b)
      .join(',');

    let archetype = world.archetypesByComponentsType.get(type);

    if (archetype === undefined) {
      const ss = SparseSet.new();
      const newArchetype: Archetype<CL> = {
        id: world.nextArchetypeId++,
        type: components,
        entitiesSS: ss,
        entities: ss.dense,
        table: {} as ArchetypeTable<CL>,
      };
      world.archetypesByComponentsType.set(type, newArchetype);
      world.archetypesById.set(newArchetype.id, newArchetype);
      archetype = newArchetype;
    }

    return archetype!;
  },

  // # Archetypes Entities & Components
  // # Get
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
      [K in keyof CL]: ComponentTypes<CL[K]>[];
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
    return archetype.table[componentId][componentIndex] as ComponentTypes<C>;
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
      [K in keyof CL]: ComponentTypes<CL[K]>;
    };
  },

  // # Add
  addComponent: <C extends Component>(world: World, entity: Entity, component: C, props?: ComponentTypes<C>) => {
    // # Fill props with default
    if (props === undefined) {
      props = {} as ComponentTypes<C>;
      // TODO: Add recursive default props
      for (const key in component) {
        const sss = component[key];
        if (defaultFn in sss) {
          props[key] = sss[defaultFn]();
        }
      }
    }

    // # Get current archetype
    let archetype = world.archetypeByEntity.get(entity);
    if (archetype === undefined) {
      archetype = World.registerArchetype(world, component);
      world.archetypeByEntity.set(entity, archetype);
    }
  },
};

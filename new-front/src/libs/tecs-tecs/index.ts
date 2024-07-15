import { ExtractSchemaType, Schema } from './schema';
import { ArrayContains } from './ts-types';

// # Component

export type Component = Schema;
export type ExtractComponentType<C> = ExtractSchemaType<C>;

// # Archetype

export type ArchetypeTableRow<C extends Component> = ExtractComponentType<C>[];

export type ArchetypeTable<CL extends ReadonlyArray<Component>> = {
  [K in keyof CL]: ArchetypeTableRow<CL[K]>;
};

export type Archetype<CL extends ReadonlyArray<Component>> = {
  id: number;
  type: CL;
  entitiesSparse: number[];
  entities: number[]; // dense
  table: ArchetypeTable<CL>;
};

// # World

export type World = {
  // # Components
  componentIdByComponent: WeakMap<Component, number>;
  componentById: Map<number, Component>;
  nextComponentId: number;

  // # Archetypes
  archetypesIdByArchetype: WeakMap<Archetype<any>, number>;
  archetypesById: Map<number, Archetype<any>>;
  archetypesByComponents: Map<string, Archetype<any>>;
  nextArchetypeId: number;
};

export const World = {
  new: (): World => ({
    componentIdByComponent: new WeakMap(),
    componentById: new Map(),
    nextComponentId: 0,

    archetypesIdByArchetype: new WeakMap(),
    archetypesByComponents: new Map(),
    archetypesById: new Map(),
    nextArchetypeId: 0,
  }),

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
    World.registerArchetype(world, [component]);

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

    let archetype = world.archetypesByComponents.get(type);

    if (archetype === undefined) {
      const newArchetype: Archetype<CL> = {
        id: world.nextArchetypeId++,
        type: components,
        entitiesSparse: [],
        entities: [],
        table: {} as ArchetypeTable<CL>,
      };
      world.archetypesByComponents.set(type, newArchetype);
      world.archetypesById.set(newArchetype.id, newArchetype);
      archetype = newArchetype;
    }

    return archetype!;
  },

  // # Archetype Entities Components
  getComponentsTable: <C extends Component, A extends Archetype<any>>(
    world: World,
    archetype: A,
    component: A extends Archetype<infer iCL> ? (ArrayContains<iCL, [C]> extends true ? C : never) : never
  ) => {
    const componentId = World.getComponentId(world, component);
    return archetype.table[componentId] as ArchetypeTableRow<C>;
  },

  getComponentsTablesList: <CL extends ReadonlyArray<Component>, A extends Archetype<any>>(
    world: World,
    archetype: A,
    ...components: A extends Archetype<infer iCL> ? (ArrayContains<iCL, CL> extends true ? CL : never) : never
  ) => {
    return components.map((component) => {
      const componentId = World.getComponentId(world, component);
      return archetype.table[componentId];
    }) as {
      [K in keyof CL]: ExtractComponentType<CL[K]>[];
    };
  },

  getComponent: <C extends Component, A extends Archetype<any>>(
    world: World,
    archetype: A,
    entity: number,
    component: A extends Archetype<infer iCL> ? (ArrayContains<iCL, [C]> extends true ? C : never) : never
  ) => {
    const componentId = World.getComponentId(world, component);
    const componentIndex = archetype.entitiesSparse[entity];
    return archetype.table[componentId][componentIndex] as ExtractComponentType<C>;
  },

  getComponents: <CL extends ReadonlyArray<Component>, A extends Archetype<any>>(
    world: World,
    archetype: A,
    entity: number,
    ...components: A extends Archetype<infer iCL> ? (ArrayContains<iCL, CL> extends true ? CL : never) : never
  ) => {
    return components.map((component) => {
      const componentId = World.getComponentId(world, component);
      const componentIndex = archetype.entitiesSparse[entity];
      return archetype.table[componentId][componentIndex];
    }) as {
      [K in keyof CL]: ExtractComponentType<CL[K]>;
    };
  },
};

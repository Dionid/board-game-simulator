import { ExtractSchemaType, number, Component } from './schema';
import { ArrayContains } from './ts-types';

// # Archetype

type ArchetypeTablesList<CL extends ReadonlyArray<Component>> = {
  [K in keyof CL]: ExtractSchemaType<CL[K]>[];
};

type Archetype<CL extends ReadonlyArray<Component>> = {
  id: number;
  type: CL;
  entitiesSparse: number[];
  entities: number[]; // dense
  tablesList: ArchetypeTablesList<CL>;
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

const World = {
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
  registerArchetype: <CL extends Component[]>(world: World, components: CL): Archetype<CL> => {
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
        tablesList: {} as ArchetypeTablesList<CL>,
      };
      world.archetypesByComponents.set(type, newArchetype);
      world.archetypesById.set(newArchetype.id, newArchetype);
      archetype = newArchetype;
    }

    return archetype!;
  },

  // # Archetype Entities Components
  getComponentsTableList: <CL extends ReadonlyArray<Component>, A extends Archetype<any>>(
    world: World,
    archetype: A,
    ...components: A extends Archetype<infer iCL> ? (ArrayContains<iCL, CL> extends true ? CL : never) : never
  ) => {
    return components.map((component) => {
      const componentId = World.getComponentId(world, component);
      return archetype.tablesList[componentId];
    }) as {
      [K in keyof CL]: ExtractSchemaType<CL[K]>[];
    };
  },

  getComponents: <CL extends ReadonlyArray<Component>>(
    world: World,
    archetype: Archetype<any>,
    entity: number,
    ...components: CL
  ) => {
    return components.map((component) => {
      const componentId = World.getComponentId(world, component);
      const componentIndex = archetype.entitiesSparse[entity];
      return archetype.tablesList[componentId][componentIndex];
    }) as {
      [K in keyof CL]: ExtractSchemaType<CL[K]>;
    };
  },
};

// # TEST

const Position = {
  x: number,
  y: number,
};

const Velocity = {
  x: number,
  y: number,
  z: number,
};

const Speed = {
  value: number,
};

const world: World = {
  componentIdByComponent: new WeakMap(),
  componentById: new Map(),
  nextComponentId: 0,

  archetypesIdByArchetype: new WeakMap(),
  archetypesByComponents: new Map(),
  archetypesById: new Map(),
  nextArchetypeId: 0,
};

const archetype1 = World.registerArchetype(world, [Position, Speed] as const);

const byGetComponentTable = () => {
  const [position] = World.getComponentsTableList(world, archetype1, Position);
  const [speed, position2] = World.getComponentsTableList(world, archetype1, Speed, Position);

  for (let i = 0; i < archetype1.entities.length; i++) {
    position[i].x += 1;
    position[i].y += 1;

    speed[i].value += 1;
  }
};

const byGetComponent = () => {
  for (const entity of archetype1.entities) {
    const [position, speed, velocity] = World.getComponents(world, archetype1, entity, Position, Speed, Velocity);
    position.x += 1;
    position.y += 1;

    speed.value += 1;

    velocity.x += 1;
    velocity.y += 1;
    velocity.z += 1;
  }
};

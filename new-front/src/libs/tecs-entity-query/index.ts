export type SparseSet<T extends number> = {
  sparse: T[];
  dense: T[];
};

export const SparseSet = {
  new: () => {
    return {
      sparse: [],
      dense: [],
    };
  },
  has: <T extends number>(sSet: SparseSet<T>, x: T) => {
    return sSet.dense[sSet.sparse[x]] === x;
  },
  add: <T extends number>(sSet: SparseSet<T>, value: T) => {
    if (
      value >= sSet.sparse.length ||
      sSet.sparse[value] === undefined ||
      sSet.sparse[value]! >= sSet.dense.length ||
      sSet.dense[sSet.sparse[value]!] !== value
    ) {
      sSet.sparse[value] = sSet.dense.length as T;
      sSet.dense.push(value);
    }
    // sSet.sparse[x] = sSet.dense.push(x) - 1;
  },
  remove: <T extends number>(sSet: SparseSet<T>, value: T) => {
    if (sSet.dense[sSet.sparse[value]!] === value) {
      const swap = sSet.dense.pop()!;
      if (swap !== value) {
        sSet.dense[sSet.sparse[value]!] = swap;
        sSet.sparse[swap] = sSet.sparse[value]!;
      }
    }
  },
};

// # ECS

export type Mask = number;

export type Entity = number;

export type Archetype = Mask;

export type ComponentId = Mask;

export type Component =
  | {
      id: ComponentId;
    }
  | ComponentId;

export const Component = {
  getComponentId: (component: Component) => {
    return typeof component === 'number' ? component : component.id;
  },
};

export type System = (world: World) => void;

export type Query = {
  mask: Mask;
  sSet: SparseSet<Entity>;
  entities: Entity[];
};

export const Query = {
  new: (mask: Mask) => {
    const sSet = SparseSet.new();

    return {
      mask: mask,
      sSet,
      entities: sSet.dense,
    };
  },
  every: (components: Component[]): Mask => {
    let mask = 0;

    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      mask |= Component.getComponentId(component);
    }

    return mask;
  },
};

export type World = {
  nextEntity: number;
  entityGraveyard: Entity[];
  queries: Query[];
  archetypeByEntity: Archetype[];
  emptyArchetype: Archetype;
};

export const World = {
  new: (props?: { rootArchetype?: Archetype }): World => {
    return {
      nextEntity: 0,
      entityGraveyard: [],
      queries: [],
      archetypeByEntity: [],
      emptyArchetype: props?.rootArchetype ?? 0,
    };
  },
  createEntity: (world: World) => {
    if (world.entityGraveyard.length > 0) {
      return world.entityGraveyard.pop()!;
    }

    const entity = world.nextEntity++;
    const archetype = world.emptyArchetype;
    world.archetypeByEntity[entity] = archetype;

    World.recalculateQueries(world, entity, archetype);

    return entity;
  },
  destroyEntity: (world: World, entity: Entity) => {
    world.entityGraveyard.push(entity);

    world.archetypeByEntity[entity] = world.emptyArchetype;

    World.removeFromQueries(world, entity);
  },
  addComponent: (world: World, entity: Entity, component: Component) => {
    const archetype = world.archetypeByEntity[entity];
    const componentId = Component.getComponentId(component);
    const newArchetype = archetype | componentId;

    if (archetype !== newArchetype) {
      world.archetypeByEntity[entity] = newArchetype;
      World.recalculateQueries(world, entity, newArchetype);
    }
  },
  removeComponent: (world: World, entity: Entity, component: Component) => {
    const archetype = world.archetypeByEntity[entity];
    const componentId = Component.getComponentId(component);
    const newArchetype = archetype & ~componentId;

    if (archetype !== newArchetype) {
      world.archetypeByEntity[entity] = newArchetype;
      World.recalculateQueries(world, entity, newArchetype);
    }
  },
  recalculateQueries: (world: World, entity: Entity, archetype: Archetype) => {
    for (let i = 0; i < world.queries.length; i++) {
      const query = world.queries[i];

      if ((archetype & query.mask) === query.mask) {
        SparseSet.add(query.sSet, entity);
      } else if (SparseSet.has(query.sSet, entity)) {
        SparseSet.remove(query.sSet, entity);
      }
    }
  },
  removeFromQueries: (world: World, entity: Entity) => {
    for (let i = 0; i < world.queries.length; i++) {
      const query = world.queries[i];

      if (SparseSet.has(query.sSet, entity)) {
        SparseSet.remove(query.sSet, entity);
      }
    }
  },
  fulfillQuery: (world: World, query: Query) => {
    const { sSet, mask } = query;
    for (let entity = 0; entity < world.archetypeByEntity.length; entity++) {
      const archetype = world.archetypeByEntity[entity];
      if ((archetype & mask) === mask) {
        SparseSet.add(sSet, entity);
      }
    }
  },
  createQuery: (world: World, mask: Mask): Entity[] => {
    const query = Query.new(mask);
    world.queries.push(query);
    World.fulfillQuery(world, query);
    return query.entities;
  },
  step: (world: World, systems: System[]) => {
    for (let i = 0; i < systems.length; i++) {
      const system = systems[i];
      system(world);
    }
  },
};

// # Example

enum Components {
  Position,
  Velocity,
}

type Vector2 = {
  x: number[];
  y: number[];
};

const Position: Component & Vector2 = {
  id: 1 << Components.Position,
  x: [],
  y: [],
};

const Velocity: Component & Vector2 = {
  id: 1 << Components.Velocity,
  x: [],
  y: [],
};

const moveSystem = (world: World) => {
  const entities = World.createQuery(world, Query.every([Position, Velocity]));

  return (world: World) => {
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];

      console.log('entity', entity);

      const velX = Velocity.x[entity];
      const velY = Velocity.y[entity];

      Position.x[entity] += velX;
      Position.y[entity] += velY;
      if (velX > 0) Velocity.x[entity] -= 1;
      if (velY > 0) Velocity.y[entity] -= 1;
    }
  };
};

const world = World.new();

const systems = [moveSystem(world)];

const entity = World.createEntity(world);
World.addComponent(world, entity, Position);
World.addComponent(world, entity, Velocity);
Position.x[entity] = 1;
Position.y[entity] = 1;
Velocity.x[entity] = 2;
Velocity.y[entity] = 2;

console.log(world);

console.log(Position, Velocity);

World.step(world, systems);

console.log(world);

console.log(Position, Velocity);

// # Sparse Set

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

// # Entity

export type Entity = number;

// # System

export type System = (world: World) => void;

// # Component

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

// # Archetype

export type ArchetypeId = Mask;

export type Archetype = {
  sSet: SparseSet<Entity>;
  entities: Entity[];
  id: ArchetypeId;
};

export const Archetype = {
  new: function (id: ArchetypeId): Archetype {
    const sSet = SparseSet.new();
    return {
      sSet: sSet,
      entities: sSet.dense,
      id,
    };
  },
  hasComponent: (arch: Archetype, componentId: ComponentId) => {
    // const componentId = Component.getComponentId(component);
    return (arch.id & componentId) === componentId;
  },
  hasEntity: (arch: Archetype, entity: Entity) => {
    return SparseSet.has(arch.sSet, entity);
  },
  addEntity: (arch: Archetype, entity: Entity) => {
    return SparseSet.add(arch.sSet, entity);
  },
  removeEntity: (arch: Archetype, entity: Entity) => {
    return SparseSet.remove(arch.sSet, entity);
  },
};

export type Query = {
  mask: Mask;
  sSet: SparseSet<ArchetypeId>;
  archetypes: Archetype[];
};

export const Query = {
  new: (mask: Mask): Query => {
    const sSet = SparseSet.new();

    return {
      mask: mask,
      sSet,
      archetypes: sSet.dense,
    };
  },
  every: (componentsIds: ComponentId[]): Mask => {
    let mask = 0;

    for (let i = 0; i < componentsIds.length; i++) {
      const componentId = componentsIds[i];
      mask |= componentId;
    }

    return mask;
  },
};

const emptyArchetype = Archetype.new(0);

export type World = {
  nextEntityId: Entity;
  archetypes: Archetype[];
  entityGraveyard: Entity[];
  archetypesIndexById: Record<ArchetypeId, number>;
  archetypesByEntities: Archetype[];
};

const getOrCreateArchetype = function (world: World, archetypeId: ArchetypeId) {
  let archetypeIndex = world.archetypesIndexById[archetypeId];

  if (archetypeIndex === undefined) {
    const newArchetype = Archetype.new(archetypeId);
    archetypeIndex = world.archetypes.push(newArchetype) - 1;
    world.archetypesIndexById[archetypeId] = archetypeIndex;
  }

  return world.archetypes[archetypeIndex];
};

export const World = {
  new: (): World => {
    return {
      nextEntityId: 0,
      archetypes: [],
      entityGraveyard: [],
      archetypesIndexById: {},
      archetypesByEntities: [],
    };
  },
  createEntity: function (world: World, prefabricate?: Archetype) {
    const entity = world.entityGraveyard.length > 0 ? world.entityGraveyard.pop()! : world.nextEntityId++;
    const archetype = prefabricate ?? emptyArchetype;
    Archetype.addEntity(archetype, entity);
    world.archetypesByEntities[entity] = archetype;
    return entity;
  },
  getOrCreateArchetype,
  destroyEntity: function (world: World, entity: Entity) {
    const archetype = world.archetypesByEntities[entity];
    Archetype.removeEntity(archetype, entity);
    world.archetypesByEntities[entity] = undefined as unknown as Archetype; // QUESTION: see in piecs
    world.entityGraveyard.push(entity);
  },
  addComponent: function (world: World, entity: Entity, componentId: ComponentId) {
    const arch = world.archetypesByEntities[entity];
    // # If current entity archetype doesn't have this component,
    // then change archetype
    if ((arch.id & componentId) !== componentId) {
      Archetype.removeEntity(arch, entity);
      const newArchetype = getOrCreateArchetype(world, arch.id | componentId);
      Archetype.addEntity(newArchetype, entity);
      world.archetypesByEntities[entity] = newArchetype;
    }
  },
  removeComponent: function (world: World, entity: Entity, componentId: ComponentId) {
    const arch = world.archetypesByEntities[entity];
    // # If current entity archetype doesn't have this component,
    // then change archetype
    if ((arch.id & componentId) === componentId) {
      Archetype.removeEntity(arch, entity);
      const newArchetype = getOrCreateArchetype(world, arch.id & ~componentId);
      Archetype.addEntity(newArchetype, entity);
      world.archetypesByEntities[entity] = newArchetype;
    }
  },
};

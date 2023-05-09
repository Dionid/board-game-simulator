import { SparseSet } from './sparse-set';

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
  new: (id: ArchetypeId): Archetype => {
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
    SparseSet.add(arch.sSet, entity);
  },
  removeEntity: (arch: Archetype, entity: Entity) => {
    SparseSet.remove(arch.sSet, entity);
  },
};

export const Query = {
  every: (components: ComponentId[]): Mask => {
    let mask = 0;

    for (let i = 0; i < components.length; i++) {
      mask |= components[i];
    }

    return mask;
  },
};

export type World = {
  deferred: ((world: World) => void)[];
  // # Size
  size: number;
  resizeSubscribers: ((newSize: number) => void)[];
  // # Components
  nextComponentId: number;
  components: Component[];
  // # Entities
  nextEntityId: Entity; // 100% number
  entityGraveyard: Entity[]; // 100% array
  // # Archetypes
  emptyArchetype: Archetype;
  graveyardArchetype: Archetype;
  archetypes: Archetype[]; // 100% array
  archetypesIndexById: Record<ArchetypeId, number>;
  archetypesByEntities: Archetype[]; // Maybe, change to Map / Record?
};

const getOrCreateArchetype = (world: World, archetypeId: ArchetypeId) => {
  let archetypeIndex = world.archetypesIndexById[archetypeId];

  if (archetypeIndex === undefined) {
    const newArchetype = Archetype.new(archetypeId);
    archetypeIndex = world.archetypes.push(newArchetype) - 1;
    world.archetypesIndexById[archetypeId] = archetypeIndex;
  }

  return world.archetypes[archetypeIndex];
};

export const World = {
  new: (props?: { size?: number }): World => {
    return {
      size: props?.size ?? 100000,
      nextComponentId: 0,
      nextEntityId: 0,
      components: [],
      archetypes: [],
      emptyArchetype: Archetype.new(0),
      graveyardArchetype: Archetype.new(0),
      entityGraveyard: [],
      archetypesIndexById: {},
      archetypesByEntities: [],
      resizeSubscribers: [],
      deferred: [],
    };
  },
  subscribeOnResize: (world: World, callback: (newSize: number) => void) => {
    world.resizeSubscribers.push(callback);
  },
  defer: (world: World, callback: (world: World) => void) => {
    world.deferred.push(callback);
  },
  applyDeferred: (world: World) => {
    for (let i = 0; i < world.deferred.length; i++) {
      world.deferred[i](world);
    }
    world.deferred = [];
  },
  step: (world: World, systems: System[]) => {
    for (let i = 0; i < systems.length; i++) {
      const system = systems[i];
      system(world);
    }
    if (world.deferred.length > 0) {
      World.applyDeferred(world);
    }
  },
  selectArchetypes: (world: World, archetypeId: Mask, callback: (archetype: Archetype) => void) => {
    for (let i = world.archetypes.length - 1; i >= 0; i--) {
      const archetype = world.archetypes[i];
      if ((archetype.id & archetypeId) === archetypeId) {
        callback(archetype);
      }
    }
  },
  // # Archetype
  getOrCreateArchetype,
  // # Component
  registerComponentId: (world: World): ComponentId => {
    const componentId = world.nextComponentId++;
    return 1 << componentId;
  },
  // # Entity
  allocateEntityId: (world: World): Entity => {
    if (world.entityGraveyard.length > 0) {
      return world.entityGraveyard.pop()!;
    }

    // # Resize world
    if (world.nextEntityId >= world.size) {
      const newSize = world.size * 2;
      console.log(`Resizing world from ${world.size} to ${newSize}`);
      world.size = newSize;
      for (let i = 0; i < world.resizeSubscribers.length; i++) {
        world.resizeSubscribers[i](newSize);
      }
    }

    return world.nextEntityId++;
  },
  spawnEntity: (world: World, prefabricate?: Archetype) => {
    const entity = World.allocateEntityId(world);
    const archetype = prefabricate ?? world.emptyArchetype;
    Archetype.addEntity(archetype, entity);
    world.archetypesByEntities[entity] = archetype;
    return entity;
  },
  destroyEntity: (world: World, entity: Entity) => {
    const archetype = world.archetypesByEntities[entity];
    Archetype.removeEntity(archetype, entity);
    world.archetypesByEntities[entity] = world.graveyardArchetype; // QUESTION: see in piecs
    world.entityGraveyard.push(entity);
  },
  addComponent: (world: World, entity: Entity, componentId: ComponentId, archetype?: Archetype) => {
    const arch = archetype ?? world.archetypesByEntities[entity];
    // # If current entity archetype doesn't have this component,
    // then change archetype
    if ((arch.id & componentId) !== componentId) {
      Archetype.removeEntity(arch, entity);
      const newArchetype = getOrCreateArchetype(world, arch.id | componentId);
      Archetype.addEntity(newArchetype, entity);
      world.archetypesByEntities[entity] = newArchetype;
    }
  },
  removeComponent: (world: World, entity: Entity, componentId: ComponentId, archetype?: Archetype) => {
    const arch = archetype ?? world.archetypesByEntities[entity];
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

import { BitSet } from './bit-set';
import { SparseSet } from './sparse-set';

// # ECS

// export type Mask = number;

// # Entity

export type Entity = number;

// # System

export type System = (world: World) => void;

// # Component

export type ComponentId = number;

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

export type ArchetypeId = string;

export type Archetype = {
  sSet: SparseSet<Entity>;
  entities: Entity[];
  id: ArchetypeId;
  mask: BitSet;
  adjacent: Archetype[];
};

export const Archetype = {
  new: (id: ArchetypeId, mask: BitSet): Archetype => {
    const sSet = SparseSet.new();
    return {
      sSet: sSet,
      entities: sSet.dense,
      id,
      mask,
      adjacent: [],
    };
  },
  hasComponent: (arch: Archetype, componentId: ComponentId) => {
    // const componentId = Component.getComponentId(component);
    return BitSet.has(arch.mask, componentId);
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

export type Query = {
  archetypes: Archetype[];
  mask: BitSet;
  tryAdd: (archetype: Archetype) => boolean;
};

export const Query = {
  new: (componentIds: ComponentId[]) => {
    const archetypes: Archetype[] = [];
    const mask = Query.makeMask(componentIds);

    return {
      archetypes,
      mask,
      tryAdd: (archetype: Archetype) => {
        if (!BitSet.contains(archetype.mask, mask)) {
          return false;
        }

        archetypes.push(archetype);
        return true;
      },
    };
  },
  makeMask: (componentIds: ComponentId[]): BitSet => {
    const max = Math.max(...componentIds);
    const mask = BitSet.new(Math.ceil(max / 32));
    for (let i = 0; i < componentIds.length; i++) {
      BitSet.or(mask, componentIds[i]!);
    }
    return mask;
  },
  // every: (components: ComponentId[]): Mask => {
  //   let mask = 0;

  //   for (let i = 0; i < components.length; i++) {
  //     mask |= components[i];
  //   }

  //   return mask;
  // },
};

export type World = {
  deferred: ((world: World) => void)[];
  queries: Query[];
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
  // graveyardArchetype: Archetype;
  archetypes: Archetype[]; // 100% array
  archetypesIndexById: Record<ArchetypeId, number>;
  archetypesByEntities: Archetype[]; // Maybe, change to Map / Record?
};

export const World = {
  new: (props?: { size?: number }): World => {
    const emptyBitSet = BitSet.new(8);

    return {
      size: props?.size ?? 100000,
      nextComponentId: 0,
      nextEntityId: 0,
      queries: [],
      components: [],
      archetypes: [],
      emptyArchetype: Archetype.new('empty', emptyBitSet),
      // graveyardArchetype: Archetype.new('graveyard', BitSet.new(8)),
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
  // # Query
  registerQuery: (world: World, componentIds: ComponentId[]): Query => {
    const query = Query.new(componentIds);
    world.queries.push(query);
    for (let i = 0; i < world.archetypes.length; i++) {
      const archetype = world.archetypes[i];
      query.tryAdd(archetype);
    }
    return query;
  },
  // # Archetype
  selectArchetypes: (world: World, componentIds: ComponentId[], callback: (archetype: Archetype) => void) => {
    const queryMask = Query.makeMask(componentIds);
    for (let i = world.archetypes.length - 1; i >= 0; i--) {
      const archetype = world.archetypes[i];
      if (BitSet.contains(archetype.mask, queryMask)) {
        callback(archetype);
      }
    }
  },
  prefabricate: (world: World, componentIdsList: ComponentId[]): Archetype => {
    let archetype = world.emptyArchetype;

    for (let i = 0; i < componentIdsList.length; i++) {
      archetype = World.getOrCreateArchetype(world, archetype, componentIdsList[i]);
    }

    return archetype;
  },
  // # Component
  registerComponentId: (world: World): ComponentId => {
    return world.nextComponentId++;
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
    world.archetypesByEntities[entity] = undefined as unknown as Archetype; // QUESTION: see in piecs
    world.entityGraveyard.push(entity);
  },
  getOrCreateArchetype: (world: World, current: Archetype, componentId: ComponentId) => {
    if (current.adjacent[componentId] !== undefined) {
      return current.adjacent[componentId];
    }

    const mask = current.mask;
    BitSet.xor(mask, componentId);
    const nextId = BitSet.toString(mask);
    let archetypeIndex = world.archetypesIndexById[nextId];

    if (archetypeIndex === undefined) {
      const newArchetype = Archetype.new(nextId, BitSet.copy(mask));
      for (let i = 0; i < world.queries.length; i++) {
        const query = world.queries[i];
        query.tryAdd(newArchetype);
      }
      archetypeIndex = world.archetypes.push(newArchetype) - 1;
      world.archetypesIndexById[newArchetype.id] = archetypeIndex;
      current.adjacent[componentId] = newArchetype;
      newArchetype.adjacent[componentId] = current;
    }

    BitSet.xor(mask, componentId);

    return world.archetypes[archetypeIndex];
  },
  addComponent: (world: World, entity: Entity, componentId: ComponentId, archetype?: Archetype) => {
    const arch = archetype ?? world.archetypesByEntities[entity];
    // # If current entity archetype doesn't have this component,
    // then change archetype
    if (!BitSet.has(arch.mask, componentId)) {
      Archetype.removeEntity(arch, entity);
      const newArchetype = World.getOrCreateArchetype(world, arch, componentId);
      Archetype.addEntity(newArchetype, entity);
      world.archetypesByEntities[entity] = newArchetype;
    }
  },
  removeComponent: (world: World, entity: Entity, componentId: ComponentId, archetype?: Archetype) => {
    const arch = archetype ?? world.archetypesByEntities[entity];
    // # If current entity archetype doesn't have this component,
    // then change archetype
    if (BitSet.has(arch.mask, componentId)) {
      Archetype.removeEntity(arch, entity);
      const newArchetype = World.getOrCreateArchetype(world, arch, componentId);
      Archetype.addEntity(newArchetype, entity);
      world.archetypesByEntities[entity] = newArchetype;
    }
  },
};

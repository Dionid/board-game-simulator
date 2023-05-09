import { BitSet } from './bit-set';
import { SparseSet } from './sparse-set';
export const Component = {
  getComponentId: (component) => {
    return typeof component === 'number' ? component : component.id;
  },
};
export const Archetype = {
  new: (id, mask) => {
    const sSet = SparseSet.new();
    return {
      sSet: sSet,
      entities: sSet.dense,
      id,
      mask,
    };
  },
  hasComponent: (arch, componentId) => {
    // const componentId = Component.getComponentId(component);
    return BitSet.has(arch.mask, componentId);
  },
  hasEntity: (arch, entity) => {
    return SparseSet.has(arch.sSet, entity);
  },
  addEntity: (arch, entity) => {
    SparseSet.add(arch.sSet, entity);
  },
  removeEntity: (arch, entity) => {
    SparseSet.remove(arch.sSet, entity);
  },
};
export const Query = {
  new: (componentIds) => {
    const archetypes = [];
    const mask = Query.makeMask(componentIds);
    return {
      archetypes,
      mask,
      tryAdd: (archetype) => {
        if (!BitSet.contains(archetype.mask, mask)) {
          return false;
        }
        archetypes.push(archetype);
        return true;
      },
    };
  },
  makeMask: (componentIds) => {
    const max = Math.max(...componentIds);
    const mask = BitSet.new(Math.ceil(max / 32));
    for (let i = 0; i < componentIds.length; i++) {
      BitSet.or(mask, componentIds[i]);
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
export const World = {
  new: (props) => {
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
  subscribeOnResize: (world, callback) => {
    world.resizeSubscribers.push(callback);
  },
  defer: (world, callback) => {
    world.deferred.push(callback);
  },
  applyDeferred: (world) => {
    for (let i = 0; i < world.deferred.length; i++) {
      world.deferred[i](world);
    }
    world.deferred = [];
  },
  step: (world, systems) => {
    for (let i = 0; i < systems.length; i++) {
      const system = systems[i];
      system(world);
    }
    if (world.deferred.length > 0) {
      World.applyDeferred(world);
    }
  },
  // # Query
  registerQuery: (world, componentIds) => {
    const query = Query.new(componentIds);
    world.queries.push(query);
    for (let i = 0; i < world.archetypes.length; i++) {
      const archetype = world.archetypes[i];
      query.tryAdd(archetype);
    }
    return query;
  },
  // # Archetype
  selectArchetypes: (world, componentIds, callback) => {
    const queryMask = Query.makeMask(componentIds);
    for (let i = world.archetypes.length - 1; i >= 0; i--) {
      const archetype = world.archetypes[i];
      if (BitSet.contains(archetype.mask, queryMask)) {
        callback(archetype);
      }
    }
  },
  prefabricate: (world, componentIdsList) => {
    let archetype = world.emptyArchetype;
    for (let i = 0; i < componentIdsList.length; i++) {
      archetype = World.getOrCreateArchetype(world, archetype, componentIdsList[i]);
    }
    return archetype;
  },
  // # Component
  registerComponentId: (world) => {
    return world.nextComponentId++;
  },
  // # Entity
  allocateEntityId: (world) => {
    if (world.entityGraveyard.length > 0) {
      return world.entityGraveyard.pop();
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
  spawnEntity: (world, prefabricate) => {
    const entity = World.allocateEntityId(world);
    const archetype = prefabricate ?? world.emptyArchetype;
    Archetype.addEntity(archetype, entity);
    world.archetypesByEntities[entity] = archetype;
    return entity;
  },
  destroyEntity: (world, entity) => {
    const archetype = world.archetypesByEntities[entity];
    Archetype.removeEntity(archetype, entity);
    world.archetypesByEntities[entity] = undefined; // QUESTION: see in piecs
    world.entityGraveyard.push(entity);
  },
  getOrCreateArchetype: (world, current, componentId) => {
    const mask = current.mask;
    BitSet.xor(mask, componentId);
    const nextId = BitSet.toString(mask);
    let archetypeIndex = world.archetypesIndexById[nextId];
    if (archetypeIndex === undefined) {
      const newArchetype = Archetype.new(nextId, BitSet.copy(mask));
      archetypeIndex = world.archetypes.push(newArchetype) - 1;
      world.archetypesIndexById[newArchetype.id] = archetypeIndex;
    }
    BitSet.xor(mask, componentId);
    return world.archetypes[archetypeIndex];
  },
  addComponent: (world, entity, componentId, archetype) => {
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
  removeComponent: (world, entity, componentId, archetype) => {
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

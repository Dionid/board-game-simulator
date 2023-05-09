import { SparseSet } from './sparse-set';
export const Component = {
  getComponentId: (component) => {
    return typeof component === 'number' ? component : component.id;
  },
};
export const $changed = Symbol('changed');
export const $changedPending = Symbol('changed-pending');
export const Archetype = {
  new: (id) => {
    const sSet = SparseSet.new();
    return {
      sSet: sSet,
      entities: sSet.dense,
      id,
      [$changed]: false,
      [$changedPending]: false,
    };
  },
  hasComponent: (arch, componentId) => {
    // const componentId = Component.getComponentId(component);
    return (arch.id & componentId) === componentId;
  },
  hasEntity: (arch, entity) => {
    return SparseSet.has(arch.sSet, entity);
  },
  addEntity: (arch, entity) => {
    if (SparseSet.add(arch.sSet, entity)) {
      arch[$changedPending] = true;
    }
  },
  removeEntity: (arch, entity) => {
    if (SparseSet.remove(arch.sSet, entity)) {
      arch[$changedPending] = true;
    }
  },
  flushChanged: (arch) => {
    arch[$changed] = arch[$changedPending];
    arch[$changedPending] = false;
  },
};
export const Query = {
  every: (components) => {
    let mask = 0;
    for (let i = 0; i < components.length; i++) {
      mask |= components[i];
    }
    return mask;
  },
};
const getOrCreateArchetype = (world, archetypeId) => {
  let archetypeIndex = world.archetypesIndexById[archetypeId];
  if (archetypeIndex === undefined) {
    const newArchetype = Archetype.new(archetypeId);
    archetypeIndex = world.archetypes.push(newArchetype) - 1;
    world.archetypesIndexById[archetypeId] = archetypeIndex;
  }
  return world.archetypes[archetypeIndex];
};
export const World = {
  new: (props) => {
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
    for (let i = 0; i < world.archetypes.length; i++) {
      Archetype.flushChanged(world.archetypes[i]);
    }
    for (let i = 0; i < systems.length; i++) {
      const system = systems[i];
      system(world);
    }
    if (world.deferred.length > 0) {
      World.applyDeferred(world);
    }
  },
  selectArchetypes: (world, archetypeId, callback) => {
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
  registerComponentId: (world) => {
    const componentId = world.nextComponentId++;
    return 1 << componentId;
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
    world.archetypesByEntities[entity] = world.graveyardArchetype; // QUESTION: see in piecs
    world.entityGraveyard.push(entity);
  },
  addComponent: (world, entity, componentId, archetype) => {
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
  removeComponent: (world, entity, componentId, archetype) => {
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

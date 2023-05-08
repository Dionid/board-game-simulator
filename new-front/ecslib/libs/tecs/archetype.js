// # Sparse Set
export const SparseSet = {
  new: () => {
    return {
      sparse: [],
      dense: [],
    };
  },
  has: (sSet, x) => {
    return sSet.dense[sSet.sparse[x]] === x;
  },
  add: (sSet, value) => {
    if (
      value >= sSet.sparse.length ||
      sSet.sparse[value] === undefined ||
      sSet.sparse[value] >= sSet.dense.length ||
      sSet.dense[sSet.sparse[value]] !== value
    ) {
      sSet.sparse[value] = sSet.dense.length;
      sSet.dense.push(value);
    }
    // sSet.sparse[x] = sSet.dense.push(x) - 1;
  },
  remove: (sSet, value) => {
    if (sSet.dense[sSet.sparse[value]] === value) {
      const swap = sSet.dense.pop();
      if (swap !== value) {
        sSet.dense[sSet.sparse[value]] = swap;
        sSet.sparse[swap] = sSet.sparse[value];
      }
    }
  },
};
export const Component = {
  getComponentId: (component) => {
    return typeof component === 'number' ? component : component.id;
  },
};
export const Archetype = {
  new: function (id) {
    const sSet = SparseSet.new();
    return {
      sSet: sSet,
      entities: sSet.dense,
      id,
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
    return SparseSet.add(arch.sSet, entity);
  },
  removeEntity: (arch, entity) => {
    return SparseSet.remove(arch.sSet, entity);
  },
};
export const Query = {
  new: (mask) => {
    const sSet = SparseSet.new();
    return {
      mask: mask,
      sSet,
      archetypes: sSet.dense,
    };
  },
  every: (componentsIds) => {
    let mask = 0;
    for (let i = 0; i < componentsIds.length; i++) {
      const componentId = componentsIds[i];
      mask |= componentId;
    }
    return mask;
  },
};
const emptyArchetype = Archetype.new(0);
const getOrCreateArchetype = function (world, archetypeId) {
  let archetypeIndex = world.archetypesIndexById[archetypeId];
  if (archetypeIndex === undefined) {
    const newArchetype = Archetype.new(archetypeId);
    archetypeIndex = world.archetypes.push(newArchetype) - 1;
    world.archetypesIndexById[archetypeId] = archetypeIndex;
  }
  return world.archetypes[archetypeIndex];
};
export const World = {
  new: () => {
    return {
      nextEntityId: 0,
      archetypes: [],
      entityGraveyard: [],
      archetypesIndexById: {},
      archetypesByEntities: [],
    };
  },
  createEntity: function (world, prefabricate) {
    const entity = world.entityGraveyard.length > 0 ? world.entityGraveyard.pop() : world.nextEntityId++;
    const archetype = prefabricate ?? emptyArchetype;
    Archetype.addEntity(archetype, entity);
    world.archetypesByEntities[entity] = archetype;
    return entity;
  },
  getOrCreateArchetype,
  destroyEntity: function (world, entity) {
    // const archetype = world.archetypesByEntities[entity];
    // Archetype.removeEntity(archetype, entity);
    // world.archetypesByEntities[entity] = emptyArchetype;
    const archetype = world.archetypesByEntities[entity];
    Archetype.removeEntity(archetype, entity);
    world.archetypesByEntities[entity] = undefined;
    world.entityGraveyard.push(entity);
  },
  addComponent: function (world, entity, componentId) {
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
  removeComponent: function (world, entity, componentId) {
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

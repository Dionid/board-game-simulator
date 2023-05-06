// Sparse Set
export var SparseSet = {
  has: function (sSet, x) {
    return sSet.dense[sSet.sparse[x]] === x;
  },
  add: function (sSet, x) {
    sSet.sparse[x] = sSet.dense.push(x) - 1;
  },
  remove: function (sSet, x) {
    var last = sSet.dense.pop();
    if (last !== x) {
      sSet.sparse[last] = sSet.sparse[x];
      sSet.dense[sSet.sparse[x]] = last;
    }
  },
};
export var Archetype = {
  new: function (mask) {
    var dense = [];
    return {
      sSet: {
        sparse: [],
        dense: dense,
      },
      entities: dense,
      mask: mask,
    };
  },
  hasEntity: function (arch, entity) {
    return SparseSet.has(arch.sSet, entity);
  },
  addEntity: function (arch, entity) {
    return SparseSet.add(arch.sSet, entity);
  },
  removeEntity: function (arch, entity) {
    return SparseSet.remove(arch.sSet, entity);
  },
};
var emptyArchetype = Archetype.new(0);
var getOrCreateArchetype = function (world, mask) {
  if (!world.archetypes.has(mask)) {
    var newArchetype = Archetype.new(mask);
    world.archetypes.set(mask, newArchetype);
  }
  return world.archetypes.get(mask);
};
export var World = {
  createEntity: function (world) {
    var id = world.entityId++;
    world.archetypesByEntities[id] = emptyArchetype;
    return id;
  },
  addComponent: function (world, entity, componentType) {
    var arch = world.archetypesByEntities[entity];
    // # If current entity archetype doesn't have this component,
    // then change archetype
    if ((arch.mask & componentType) !== componentType) {
      Archetype.removeEntity(arch, entity);
      var newArchetype = getOrCreateArchetype(world, arch.mask | componentType);
      Archetype.addEntity(newArchetype, entity);
      world.archetypesByEntities[entity] = newArchetype;
    }
  },
};

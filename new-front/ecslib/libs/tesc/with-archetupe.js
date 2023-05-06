// type ComponentId = number;
var __read =
  (this && this.__read) ||
  function (o, n) {
    var m = typeof Symbol === 'function' && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
      r,
      ar = [],
      e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error: error };
    } finally {
      try {
        if (r && !r.done && (m = i['return'])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
var componentIndex = {};
var archetypeIndex = new Map();
var entityIndex = {};
var hasComponent = function (entityId, componentId) {
  var entityIndexItem = entityIndex[entityId];
  var archetypeMap = componentIndex[componentId];
  return archetypeMap[entityIndexItem.archetype.id] !== undefined;
};
// const getEntitiesByComponents = (entityType: EntityType): EntityId[] => {
//     const archetype = archetypeIndex.get(entityType)
// }
var getComponent = function (entityId, componentId) {
  var entityIndexItem = entityIndex[entityId];
  var archetype = entityIndexItem.archetype;
  var componentArchetypesMap = componentIndex[componentId];
  if (!componentArchetypesMap[archetype.id]) {
    return undefined;
  }
  return archetype.components[componentArchetypesMap[archetype.id]][entityIndexItem.row];
};
var moveEntity = function (archetype, row, componentId, nextArchetype) {
  var componentArchetypesColumn = componentIndex[componentId];
  var column = archetype.components[componentArchetypesColumn[archetype.id]];
  var component = column[row];
  // # Delete from old archetype
  column.splice(row, 1);
  // ...
  // # Add to new archetype
  nextArchetype.components[componentArchetypesColumn[nextArchetype.id]][row] = component;
  // ...
};
var addComponent = function (entityId, componentId) {
  var entityIndexItem = entityIndex[entityId];
  var archetype = entityIndexItem.archetype;
  var nextArchetype = archetype.edges[componentId].add;
  if (!nextArchetype) {
    var entityType = __spreadArray(__spreadArray([], __read(archetype.entityType), false), [componentId], false);
    // TODO: THIS WILL NOT WORK, BECAUSE entityType IS UNIQUE ARRAY
    nextArchetype = archetypeIndex.get(entityType);
    if (!nextArchetype) {
      nextArchetype = {
        id: 0,
        entityType: entityType,
        components: [],
        edges: {},
      };
      archetypeIndex.set(entityType, nextArchetype);
    }
    archetype.edges[componentId].add = nextArchetype;
  }
  moveEntity(archetype, entityIndexItem.row, componentId, nextArchetype);
};
var removeComponent = function (entityId, componentId) {
  var entityIndexItem = entityIndex[entityId];
  var archetype = entityIndexItem.archetype;
  var nextArchetype = archetype.edges[componentId].remove;
  if (!nextArchetype) {
    var entityType = archetype.entityType.filter(function (id) {
      return id !== componentId;
    });
    // TODO: THIS WILL NOT WORK, BECAUSE entityType IS UNIQUE ARRAY
    nextArchetype = archetypeIndex.get(entityType);
    if (!nextArchetype) {
      nextArchetype = {
        id: 0,
        entityType: entityType,
        components: [],
        edges: {},
      };
      archetypeIndex.set(entityType, nextArchetype);
    }
    archetype.edges[componentId].add = nextArchetype;
  }
  moveEntity(archetype, entityIndexItem.row, componentId, nextArchetype);
};
export {};

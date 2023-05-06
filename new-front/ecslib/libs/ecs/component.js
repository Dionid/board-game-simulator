export var ComponentFactory = function (name) {
  return {
    name: name,
    new: function (component) {
      return component;
    },
  };
};
export var Pool = {
  tryGet: function (pool, entityId) {
    return pool.components[entityId];
  },
  get: function (pool, entityId) {
    var comp = pool.components[entityId];
    if (comp === undefined) {
      throw new Error("Can't get comp by entityId ".concat(entityId));
    }
    return comp;
  },
  add: function (pool, entityId, component) {
    pool.components[entityId] = component;
    pool.entityIds.push(entityId);
    return pool.components[entityId];
  },
  remove: function (pool, entityId) {
    // const { [entityId]: omit, ...newData } = pool.components;
    // pool.components = newData;
    delete pool.components[entityId];
    pool.entityIds.splice(pool.entityIds.indexOf(entityId), 1);
  },
};

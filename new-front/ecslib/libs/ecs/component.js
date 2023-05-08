export const ComponentFactory = (name) => {
  return {
    name,
    new: (component) => {
      return component;
    },
  };
};
export const Pool = {
  tryGet: (pool, entityId) => {
    return pool.components[entityId];
  },
  get: (pool, entityId) => {
    const comp = pool.components[entityId];
    if (comp === undefined) {
      throw new Error(`Can't get comp by entityId ${entityId}`);
    }
    return comp;
  },
  add: (pool, entityId, component) => {
    pool.components[entityId] = component;
    pool.entityIds.push(entityId);
    return pool.components[entityId];
  },
  remove: (pool, entityId) => {
    // const { [entityId]: omit, ...newData } = pool.components;
    // pool.components = newData;
    delete pool.components[entityId];
    pool.entityIds.splice(pool.entityIds.indexOf(entityId), 1);
  },
};

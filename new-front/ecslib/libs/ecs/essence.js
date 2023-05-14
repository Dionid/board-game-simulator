import { Pool } from './component';
import { TypedObject } from '../typed-object';
export const Essence = {
  getPool: (essence, componentFactory) => {
    return essence.pools[componentFactory.name];
  },
  addPool: (essence, poolName, pool) => {
    essence.pools[poolName] = pool;
  },
  getOrAddPoolByName: (essence, poolName) => {
    const pool = essence.pools[poolName];
    if (!pool) {
      Essence.addPool(essence, poolName, { components: {}, entityIds: [] });
      return Essence.getOrAddPoolByName(essence, poolName);
    }
    return pool;
  },
  getOrAddPool: (essence, componentFactory) => {
    return Essence.getOrAddPoolByName(essence, componentFactory.name);
  },
  getEntitiesByComponents: (essence, componentFactories) => {
    const pools = [];
    for (let i = 0; i < componentFactories.length; i++) {
      const compName = componentFactories[i].name;
      const pool = essence.pools[compName];
      if (!pool) {
        return [];
      }
      pools.push(pool);
    }
    const entityIds = {};
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      // # On first iteration we extract entities
      if (i === 0) {
        const ids = pool.entityIds;
        for (let j = 0; j < ids.length; j++) {
          const id = ids[j];
          entityIds[id] = true;
        }
        continue;
      }
      // # On second and further iterations we filter entities
      const ids = TypedObject.keys(entityIds);
      for (let j = 0; j < ids.length; j++) {
        const id = ids[j];
        if (!pool.components[id]) {
          delete entityIds[id];
        }
      }
    }
    return TypedObject.keys(entityIds);
  },
  destroyEntity: (essence, entityId) => {
    Object.keys(essence.pools).forEach((rPoolName) => {
      const poolName = rPoolName;
      const pool = essence.pools[poolName];
      if (!pool) {
        return;
      }
      if (pool.components[entityId]) {
        Pool.remove(pool, entityId);
      }
    });
  },
  // # EVENTS
  getEvents: (essence, eventFactory) => {
    return essence.events.active[eventFactory.name];
  },
  addEvent: (essence, event, options) => {
    let eventList;
    if (options?.immediately) {
      eventList = essence.events.active;
    } else {
      eventList = essence.events.pending;
    }
    const map = eventList[event.name];
    if (map) {
      map.push(event);
    } else {
      eventList[event.name] = [event];
    }
  },
  flushEvents: (essence) => {
    for (const pendingEventKeys of Object.keys(essence.events.pending)) {
      const pendingEvents = essence.events.pending[pendingEventKeys];
      const activeEvents = essence.events.active[pendingEventKeys];
      if (activeEvents) {
        // essence.events.active![pendingEventKeys] = activeEvents.concat(pendingEvents);
        for (const event of pendingEvents) {
          activeEvents.push(JSON.parse(JSON.stringify(event)));
        }
      } else {
        essence.events.active[pendingEventKeys] = [];
        for (const event of pendingEvents) {
          // TODO: Remove JSON.parse(JSON.stringify()) after i get how to copy normally
          essence.events.active[pendingEventKeys].push(JSON.parse(JSON.stringify(event)));
        }
      }
    }
    essence.events.pending = {};
  },
  clearEvents: (essence) => {
    for (const eventName of Object.keys(essence.events.active)) {
      const eventList = essence.events.active[eventName];
      if (!eventList) {
        return;
      }
      const newEventsList = [];
      for (const event of eventList) {
        if (event.liveFor) {
          event.liveFor -= 1;
          if (event.liveFor > 0) {
            newEventsList.push(event);
          }
        }
      }
      if (newEventsList.length !== eventList.length) {
        essence.events.active[eventName] = newEventsList;
      }
    }
  },
};

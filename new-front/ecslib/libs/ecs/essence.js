var __values =
  (this && this.__values) ||
  function (o) {
    var s = typeof Symbol === 'function' && Symbol.iterator,
      m = s && o[s],
      i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === 'number')
      return {
        next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
        },
      };
    throw new TypeError(s ? 'Object is not iterable.' : 'Symbol.iterator is not defined.');
  };
import { Pool } from './component';
import { TypedObject } from '../typed-object';
export var Essence = {
  getPool: function (essence, componentFactory) {
    return essence.pools[componentFactory.name];
  },
  addPool: function (essence, poolName, pool) {
    essence.pools[poolName] = pool;
  },
  getOrAddPoolByName: function (essence, poolName) {
    var pool = essence.pools[poolName];
    if (!pool) {
      Essence.addPool(essence, poolName, { components: {}, entityIds: [] });
      return Essence.getOrAddPoolByName(essence, poolName);
    }
    return pool;
  },
  getOrAddPool: function (essence, componentFactory) {
    return Essence.getOrAddPoolByName(essence, componentFactory.name);
  },
  getEntitiesByComponents: function (essence, componentFactories) {
    var pools = [];
    for (var i = 0; i < componentFactories.length; i++) {
      var compName = componentFactories[i].name;
      var pool = essence.pools[compName];
      if (!pool) {
        return [];
      }
      pools.push(pool);
    }
    var entityIds = {};
    for (var i = 0; i < pools.length; i++) {
      var pool = pools[i];
      // # On first iteration we extract entities
      if (i === 0) {
        var ids_1 = pool.entityIds;
        for (var j = 0; j < ids_1.length; j++) {
          var id = ids_1[j];
          entityIds[id] = true;
        }
        continue;
      }
      // # On second and further iterations we filter entities
      var ids = TypedObject.keys(entityIds);
      for (var j = 0; j < ids.length; j++) {
        var id = ids[j];
        if (!pool.components[id]) {
          delete entityIds[id];
        }
      }
    }
    return TypedObject.keys(entityIds);
  },
  destroyEntity: function (essence, entityId) {
    Object.keys(essence.pools).forEach(function (rPoolName) {
      var poolName = rPoolName;
      var pool = essence.pools[poolName];
      if (!pool) {
        return;
      }
      if (pool.components[entityId]) {
        Pool.remove(pool, entityId);
      }
    });
  },
  // # EVENTS
  getEvents: function (essence, eventFactory) {
    return essence.events.active[eventFactory.name];
  },
  addEvent: function (essence, event, options) {
    var eventList;
    if (options === null || options === void 0 ? void 0 : options.immediately) {
      eventList = essence.events.active;
    } else {
      eventList = essence.events.pending;
    }
    var map = eventList[event.name];
    if (map) {
      map.push(event);
    } else {
      eventList[event.name] = [event];
    }
  },
  flushEvents: function (essence) {
    var e_1, _a, e_2, _b, e_3, _c;
    try {
      for (var _d = __values(Object.keys(essence.events.pending)), _e = _d.next(); !_e.done; _e = _d.next()) {
        var pendingEventKeys = _e.value;
        var pendingEvents = essence.events.pending[pendingEventKeys];
        var activeEvents = essence.events.active[pendingEventKeys];
        if (activeEvents) {
          try {
            // essence.events.active![pendingEventKeys] = activeEvents.concat(pendingEvents);
            for (
              var pendingEvents_1 = ((e_2 = void 0), __values(pendingEvents)),
                pendingEvents_1_1 = pendingEvents_1.next();
              !pendingEvents_1_1.done;
              pendingEvents_1_1 = pendingEvents_1.next()
            ) {
              var event_1 = pendingEvents_1_1.value;
              activeEvents.push(JSON.parse(JSON.stringify(event_1)));
            }
          } catch (e_2_1) {
            e_2 = { error: e_2_1 };
          } finally {
            try {
              if (pendingEvents_1_1 && !pendingEvents_1_1.done && (_b = pendingEvents_1.return))
                _b.call(pendingEvents_1);
            } finally {
              if (e_2) throw e_2.error;
            }
          }
        } else {
          essence.events.active[pendingEventKeys] = [];
          try {
            for (
              var pendingEvents_2 = ((e_3 = void 0), __values(pendingEvents)),
                pendingEvents_2_1 = pendingEvents_2.next();
              !pendingEvents_2_1.done;
              pendingEvents_2_1 = pendingEvents_2.next()
            ) {
              var event_2 = pendingEvents_2_1.value;
              // TODO: Remove JSON.parse(JSON.stringify()) after i get how to copy normally
              essence.events.active[pendingEventKeys].push(JSON.parse(JSON.stringify(event_2)));
            }
          } catch (e_3_1) {
            e_3 = { error: e_3_1 };
          } finally {
            try {
              if (pendingEvents_2_1 && !pendingEvents_2_1.done && (_c = pendingEvents_2.return))
                _c.call(pendingEvents_2);
            } finally {
              if (e_3) throw e_3.error;
            }
          }
        }
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
    essence.events.pending = {};
  },
  clearEvents: function (essence) {
    var e_4, _a, e_5, _b;
    try {
      for (var _c = __values(Object.keys(essence.events.active)), _d = _c.next(); !_d.done; _d = _c.next()) {
        var eventName = _d.value;
        var eventList = essence.events.active[eventName];
        if (!eventList) {
          return;
        }
        var newEventsList = [];
        try {
          for (
            var eventList_1 = ((e_5 = void 0), __values(eventList)), eventList_1_1 = eventList_1.next();
            !eventList_1_1.done;
            eventList_1_1 = eventList_1.next()
          ) {
            var event_3 = eventList_1_1.value;
            if (event_3.liveFor) {
              event_3.liveFor -= 1;
              if (event_3.liveFor > 0) {
                newEventsList.push(event_3);
              }
            }
          }
        } catch (e_5_1) {
          e_5 = { error: e_5_1 };
        } finally {
          try {
            if (eventList_1_1 && !eventList_1_1.done && (_b = eventList_1.return)) _b.call(eventList_1);
          } finally {
            if (e_5) throw e_5.error;
          }
        }
        if (newEventsList.length !== eventList.length) {
          essence.events.active[eventName] = newEventsList;
        }
      }
    } catch (e_4_1) {
      e_4 = { error: e_4_1 };
    } finally {
      try {
        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
      } finally {
        if (e_4) throw e_4.error;
      }
    }
  },
};

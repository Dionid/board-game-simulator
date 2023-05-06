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
import { $systemId } from './system';
import { Essence } from './essence';
import { UNSAFE_internals } from './internals';
export var World = {
  new: function (world) {
    var systems = world.systems || [];
    var systemIds = world.systemIds || 0;
    for (var i = 0; i < systems.length; i++) {
      var system = systems[i];
      system[$systemId] = systemIds++;
    }
    var newWorld = {
      id: UNSAFE_internals.worlds.length,
      systemIds: systemIds,
      step: world.step || 0,
      latestSystemId: -1,
      ctx: world.ctx,
      essence: world.essence,
      systems: systems,
    };
    UNSAFE_internals.worlds.push(newWorld);
    return newWorld;
  },
  run: function (world) {
    var e_1, _a;
    // # Store previous world
    var prevWorld = UNSAFE_internals.currentWorldId;
    // # Assign current one
    UNSAFE_internals.currentWorldId = world.id;
    // # Activate pending events
    Essence.flushEvents(world.essence);
    try {
      // # Run systems
      for (var _b = __values(world.systems), _c = _b.next(); !_c.done; _c = _b.next()) {
        var system = _c.value;
        // # Assign current system
        world.latestSystemId = system[$systemId];
        // # Run system
        system(world);
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
    // # Remove done events
    Essence.clearEvents(world.essence);
    // # Increment step
    world.step++;
    // # Restore previous world
    UNSAFE_internals.currentWorldId = prevWorld;
  },
};

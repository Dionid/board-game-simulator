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
import { Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import { Essence } from '../../../../ecs/essence';
import { GameObjectComponent } from '../../components';
import { CreateBGCGameObjectEvent } from '../../events';
export var CreateBGCGameObjectEventSystem = function () {
  return function (_a) {
    var e_1, _b, e_2, _c;
    var essence = _a.essence;
    var events = Essence.getEvents(essence, CreateBGCGameObjectEvent);
    if (!events) {
      return;
    }
    var gameObjectP = Essence.getOrAddPool(essence, GameObjectComponent);
    try {
      for (
        var events_1 = __values(events), events_1_1 = events_1.next();
        !events_1_1.done;
        events_1_1 = events_1.next()
      ) {
        var event_1 = events_1_1.value;
        var bgcGameObjectEntity = EntityId.new();
        // # Add GameObject Component
        Pool.add(gameObjectP, bgcGameObjectEntity, GameObjectComponent.new(true));
        try {
          for (
            var _d = ((e_2 = void 0), __values(event_1.payload.components)), _e = _d.next();
            !_e.done;
            _e = _d.next()
          ) {
            var gameObjectComponent = _e.value;
            var pool = Essence.getOrAddPoolByName(essence, gameObjectComponent.componentName);
            if (typeof gameObjectComponent.component === 'object') {
              // TODO: Remove JSON.parse(JSON.stringify()) after i get how to copy normally
              Pool.add(pool, bgcGameObjectEntity, JSON.parse(JSON.stringify(gameObjectComponent.component)));
            } else {
              // TODO: Remove JSON.parse(JSON.stringify()) after i get how to copy normally
              Pool.add(pool, bgcGameObjectEntity, gameObjectComponent.component);
            }
          }
        } catch (e_2_1) {
          e_2 = { error: e_2_1 };
        } finally {
          try {
            if (_e && !_e.done && (_c = _d.return)) _c.call(_d);
          } finally {
            if (e_2) throw e_2.error;
          }
        }
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (events_1_1 && !events_1_1.done && (_b = events_1.return)) _b.call(events_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
  };
};

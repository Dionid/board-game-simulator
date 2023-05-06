import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import { ScaleComponent, SizeComponent } from '../../components';
import { ZoomInEvent, ZoomOutEvent } from '../../events';
export var ZoomSystem = function () {
  return function (_a) {
    var essence = _a.essence,
      ctx = _a.ctx;
    var cameraEntity = ctx().cameraEntity;
    var zoomOutEvents = Essence.getEvents(essence, ZoomOutEvent);
    var zoomInEvents = Essence.getEvents(essence, ZoomInEvent);
    if (!zoomOutEvents && !zoomInEvents) {
      return;
    }
    var scaleCP = Essence.getOrAddPool(essence, ScaleComponent);
    var sizeCP = Essence.getOrAddPool(essence, SizeComponent);
    var scaleC = Pool.get(scaleCP, cameraEntity);
    var sizeC = Pool.get(sizeCP, cameraEntity);
    if (zoomOutEvents) {
      zoomOutEvents.forEach(function () {
        if (scaleC.x > 0.6) {
          scaleC.x -= 0.1;
          scaleC.y -= 0.1;
          sizeC.width *= 1.1;
          sizeC.height *= 1.1;
        }
      });
    }
    if (zoomInEvents) {
      zoomInEvents.forEach(function () {
        if (scaleC.x < 3) {
          scaleC.x += 0.1;
          scaleC.y += 0.1;
          sizeC.width *= 0.9;
          sizeC.height *= 0.9;
        }
      });
    }
  };
};

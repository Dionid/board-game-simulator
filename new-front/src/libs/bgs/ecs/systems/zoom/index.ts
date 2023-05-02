import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import { ScaleComponent, SizeComponent } from '../../components';
import { ZoomInEvent, ZoomOutEvent } from '../../events';

export const ZoomSystem = (): System<{
  cameraEntity: EntityId;
}> => {
  return {
    run: async ({ essence, ctx }) => {
      const { cameraEntity } = ctx();
      const zoomOutEvents = Essence.getEvents(essence, ZoomOutEvent);
      const zoomInEvents = Essence.getEvents(essence, ZoomInEvent);

      if (!zoomOutEvents && !zoomInEvents) {
        return;
      }

      const scaleCP = Essence.getOrAddPool(essence, ScaleComponent);
      const sizeCP = Essence.getOrAddPool(essence, SizeComponent);

      const scaleC = Pool.get(scaleCP, cameraEntity);
      const sizeC = Pool.get(sizeCP, cameraEntity);

      if (zoomOutEvents) {
        zoomOutEvents.forEach(() => {
          if (scaleC.x > 0.6) {
            scaleC.x -= 0.1;
            scaleC.y -= 0.1;
            sizeC.width *= 1.1;
            sizeC.height *= 1.1;
          }
        });
      }

      if (zoomInEvents) {
        zoomInEvents.forEach(() => {
          if (scaleC.x < 3) {
            scaleC.x += 0.1;
            scaleC.y += 0.1;
            sizeC.width *= 0.9;
            sizeC.height *= 0.9;
          }
        });
      }
    },
  };
};

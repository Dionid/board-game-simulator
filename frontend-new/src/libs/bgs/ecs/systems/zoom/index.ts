import {
  CameraComponent,
  CameraComponentName,
  PlayerComponent,
  PlayerComponentName,
  ScaleComponent,
  ScaleComponentName,
  SizeComponent,
  SizeComponentName,
  ZoomInEventComponent,
  ZoomInEventComponentName,
  ZoomOutEventComponent,
  ZoomOutEventComponentName,
} from '../../components';
import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';

export const ZoomSystem = (): System<{
  [ZoomInEventComponentName]: ZoomInEventComponent;
  [ZoomOutEventComponentName]: ZoomOutEventComponent;
  [ScaleComponentName]: ScaleComponent;
  [CameraComponentName]: CameraComponent;
  [PlayerComponentName]: PlayerComponent;
  [SizeComponentName]: SizeComponent;
}> => {
  return {
    run: async ({ essence }) => {
      const zoomInEntities = Essence.filter(essence, [ZoomInEventComponentName]);
      const zoomOutEntities = Essence.filter(essence, [ZoomOutEventComponentName]);

      if (zoomInEntities.length === 0 && zoomOutEntities.length === 0) {
        return;
      }

      const zoomInCP = Essence.getOrAddPool(essence, ZoomInEventComponentName);
      const zoomOutCP = Essence.getOrAddPool(essence, ZoomOutEventComponentName);

      const cameraEntities = Essence.filter(essence, [CameraComponentName, ScaleComponentName, PlayerComponentName]);
      const scaleCP = Essence.getOrAddPool(essence, ScaleComponentName);
      const sizeCP = Essence.getOrAddPool(essence, SizeComponentName);
      const cameraEntity = cameraEntities[0];

      const scaleC = Pool.get(scaleCP, cameraEntity);
      const sizeC = Pool.get(sizeCP, cameraEntity);

      zoomOutEntities.forEach((zoomOutEntity) => {
        if (scaleC.data.x > 0.6) {
          scaleC.data.x -= 0.1;
          scaleC.data.y -= 0.1;
          sizeC.data.width *= 1.1;
          sizeC.data.height *= 1.1;
        }
        Pool.delete(zoomOutCP, zoomOutEntity);
      });

      zoomInEntities.forEach((zoomInEntity) => {
        if (scaleC.data.x < 3) {
          scaleC.data.x += 0.1;
          scaleC.data.y += 0.1;
          sizeC.data.width *= 0.9;
          sizeC.data.height *= 0.9;
        }
        Pool.delete(zoomInCP, zoomInEntity);
      });
    },
  };
};

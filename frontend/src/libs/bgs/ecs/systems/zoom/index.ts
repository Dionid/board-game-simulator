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
import { World } from '../../../../ecs/world';
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
    run: async ({ world }) => {
      const zoomInEntities = World.filter(world, [ZoomInEventComponentName]);
      const zoomOutEntities = World.filter(world, [ZoomOutEventComponentName]);

      if (zoomInEntities.length === 0 && zoomOutEntities.length === 0) {
        return;
      }

      const zoomInCP = World.getOrAddPool(world, ZoomInEventComponentName);
      const zoomOutCP = World.getOrAddPool(world, ZoomOutEventComponentName);

      const cameraEntities = World.filter(world, [CameraComponentName, ScaleComponentName, PlayerComponentName]);
      const scaleCP = World.getOrAddPool(world, ScaleComponentName);
      const sizeCP = World.getOrAddPool(world, SizeComponentName);
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
        if (scaleC.data.x < 1.4) {
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

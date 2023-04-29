import { System } from '../../../../ecs/system';
import {
  CameraComponent,
  CameraComponentName,
  DraggableComponent,
  DraggableComponentName,
  HandComponent,
  HandComponentName,
  IsDraggingComponent,
  IsDraggingComponentName,
  IsLockedComponent,
  IsSelectedComponent,
  OwnerComponent,
  OwnerComponentName,
  PanModeComponent,
  PanModeComponentName,
  PlayerComponent,
  PlayerComponentName,
  PositionComponentName,
  PositionComponent,
  ScaleComponent,
  ScaleComponentName,
  IsLockedComponentName,
  IsSelectedComponentName,
} from '../../components';
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import { Vector2 } from '../../../../math';

export const DragSystem = (): System<{
  [PlayerComponentName]: PlayerComponent;
  [OwnerComponentName]: OwnerComponent;
  [HandComponentName]: HandComponent;
  [DraggableComponentName]: DraggableComponent;
  [PositionComponentName]: PositionComponent;
  [IsDraggingComponentName]: IsDraggingComponent;
  [IsSelectedComponentName]: IsSelectedComponent;
  [IsLockedComponentName]: IsLockedComponent;
  [PanModeComponentName]: PanModeComponent;
  [CameraComponentName]: CameraComponent;
  [ScaleComponentName]: ScaleComponent;
}> => {
  return {
    run: async (props) => {
      const { essence } = props;

      const panModeEntities = Essence.filter(essence, ['PanModeComponent']);

      // . Disable drag in pan mode
      if (panModeEntities.length > 0) {
        return;
      }

      const playerCameraEntities = Essence.filter(essence, [
        PlayerComponentName,
        CameraComponentName,
        ScaleComponentName,
      ]);
      const playerCameraEntity = playerCameraEntities[0];
      const playerMouseEntities = Essence.filter(essence, [PlayerComponentName, OwnerComponentName, HandComponentName]);
      let selectedAndDraggableEntities = Essence.filter(essence, [
        DraggableComponentName,
        PositionComponentName,
        IsSelectedComponentName,
      ]);

      // . Filter out locked entities
      const isLockedEntities = Essence.filter(essence, [IsLockedComponentName]);
      selectedAndDraggableEntities = selectedAndDraggableEntities.filter((id) => isLockedEntities.indexOf(id) === -1);

      if (selectedAndDraggableEntities.length === 0) {
        return;
      }

      const handPool = Essence.getOrAddPool(essence, HandComponentName);

      selectedAndDraggableEntities.forEach((selectedAndDraggableEntity) => {
        const positionCP = Essence.getOrAddPool(essence, PositionComponentName);
        const positionC = Pool.get(positionCP, selectedAndDraggableEntity);
        const scaleCP = Essence.getOrAddPool(essence, ScaleComponentName);
        const cameraScaleC = Pool.get(scaleCP, playerCameraEntity);

        playerMouseEntities.forEach((playerMouseEntity) => {
          const {
            data: { onCameraPosition },
          } = Pool.get(handPool, playerMouseEntity);
          const delta = Vector2.compareAndChange(onCameraPosition.previous, onCameraPosition.current);
          positionC.data.x += delta.x / cameraScaleC.data.x;
          positionC.data.y += delta.y / cameraScaleC.data.y;
        });
      });
    },
  };
};

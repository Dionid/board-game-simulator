import { System } from '../../../../ecs/system';
import {
  CameraComponent,
  CameraComponentName,
  DraggableComponent,
  HandComponent,
  IsDraggingComponent,
  IsLockedComponent,
  IsSelectedComponent,
  OwnerComponent,
  PanModeComponent,
  PanModeComponentName,
  PlayerComponent,
  PlayerComponentName,
  PositionComponent,
  ScaleComponent,
  ScaleComponentName,
} from '../../components';
import { World } from '../../../../ecs/world';
import { Pool } from '../../../../ecs/component';
import { Vector2 } from '../../../../math';

export const DragSystem = (): System<{
  PlayerComponent: PlayerComponent;
  OwnerComponent: OwnerComponent;
  HandComponent: HandComponent;
  DraggableComponent: DraggableComponent;
  PositionComponent: PositionComponent;
  IsDraggingComponent: IsDraggingComponent;
  IsSelectedComponent: IsSelectedComponent;
  IsLockedComponent: IsLockedComponent;
  [PanModeComponentName]: PanModeComponent;
  [CameraComponentName]: CameraComponent;
  [ScaleComponentName]: ScaleComponent;
}> => {
  return {
    run: async (props) => {
      const { world } = props;

      const panModeEntities = World.filter(world, ['PanModeComponent']);

      // . Disable drag in pan mode
      if (panModeEntities.length > 0) {
        return;
      }

      const playerCameraEntities = World.filter(world, [PlayerComponentName, CameraComponentName, ScaleComponentName]);
      const playerCameraEntity = playerCameraEntities[0];
      const playerMouseEntities = World.filter(world, ['PlayerComponent', 'OwnerComponent', 'HandComponent']);
      let selectedAndDraggableEntities = World.filter(world, [
        'DraggableComponent',
        'PositionComponent',
        'IsSelectedComponent',
      ]);

      // . Filter out locked entities
      const isLockedEntities = World.filter(world, ['IsLockedComponent']);
      selectedAndDraggableEntities = selectedAndDraggableEntities.filter((id) => isLockedEntities.indexOf(id) === -1);

      if (selectedAndDraggableEntities.length === 0) {
        return;
      }

      const handPool = World.getOrAddPool(world, 'HandComponent');

      selectedAndDraggableEntities.forEach((selectedAndDraggableEntity) => {
        const positionCP = World.getOrAddPool(world, 'PositionComponent');
        const positionC = Pool.get(positionCP, selectedAndDraggableEntity);
        const scaleCP = World.getOrAddPool(world, ScaleComponentName);
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

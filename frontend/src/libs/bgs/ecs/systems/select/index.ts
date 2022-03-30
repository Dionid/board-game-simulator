import { System } from '../../../../ecs/system';
import {
  CameraComponent,
  CameraComponentName,
  HandComponent,
  IsSelectedComponent,
  OwnerComponent,
  PlayerComponent,
  PlayerComponentName,
  PositionComponent,
  PositionComponentName,
  ScaleComponent,
  ScaleComponentName,
  SelectableComponent,
  SizeComponent,
} from '../../components';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import { Size, Square, Vector2 } from '../../../../math';

export const SelectSystem = (): System<{
  HandComponent: HandComponent;
  PlayerComponent: PlayerComponent;
  OwnerComponent: OwnerComponent;
  SelectableComponent: SelectableComponent;
  IsSelectedComponent: IsSelectedComponent;
  SizeComponent: SizeComponent;
  [PositionComponentName]: PositionComponent;
  [CameraComponentName]: CameraComponent;
  [ScaleComponentName]: ScaleComponent;
}> => {
  return {
    run: async ({ world }) => {
      const selectableEntities = World.filter(world, ['SelectableComponent', 'PositionComponent', 'SizeComponent']);

      if (selectableEntities.length === 0) {
        return;
      }

      const playerCameraEntities = World.filter(world, [PlayerComponentName, CameraComponentName, ScaleComponentName]);
      const playerCameraEntity = playerCameraEntities[0];
      const playerMouseEntities = World.filter(world, ['PlayerComponent', 'OwnerComponent', 'HandComponent']);
      const isSelectedEntities = World.filter(world, ['IsSelectedComponent']);

      const isSelectedComponentsPool = World.getOrAddPool(world, 'IsSelectedComponent');

      const handPool = World.getOrAddPool(world, 'HandComponent');

      playerMouseEntities.forEach((playerMouseEntity) => {
        const playerMouseComponent = Pool.get(handPool, playerMouseEntity);

        // . IF MOUSE UP
        if (!playerMouseComponent.data.click.current.down) {
          if (isSelectedEntities.length) {
            isSelectedEntities.forEach((entity) => {
              Pool.delete(isSelectedComponentsPool, entity);
            });
          }
        } else if (playerMouseComponent.data.click.current.down && isSelectedEntities.length === 0) {
          const positionCP = World.getOrAddPool(world, 'PositionComponent');
          const sizeCP = World.getOrAddPool(world, 'SizeComponent');
          const scaleCP = World.getOrAddPool(world, ScaleComponentName);
          const cameraScaleC = Pool.get(scaleCP, playerCameraEntity);
          const cameraPositionC = Pool.get(positionCP, playerCameraEntity);

          const mouseOnEntities: EntityId[] = [];

          selectableEntities.forEach((selectableEntity) => {
            const positionC = Pool.get(positionCP, selectableEntity);
            const sizeC = Pool.get(sizeCP, selectableEntity);
            if (
              Square.isInside(
                {
                  ...Vector2.multiply(Vector2.subtract(positionC.data, cameraPositionC.data), cameraScaleC.data),
                  ...Size.multiplyByVector2(sizeC.data, cameraScaleC.data),
                },
                playerMouseComponent.data.onCameraPosition.current
              )
            ) {
              mouseOnEntities.push(selectableEntity);
            }
          });

          if (mouseOnEntities.length === 0) {
            return;
          }

          let lastZIndex = 0;
          const maxZPositionEntity = mouseOnEntities.reduce((prev, cur) => {
            const positionC = Pool.get(positionCP, cur);

            if (positionC.data.z > lastZIndex) {
              lastZIndex = positionC.data.z;
              return cur;
            }

            lastZIndex = positionC.data.z;
            return prev;
          });

          Pool.add(isSelectedComponentsPool, maxZPositionEntity, {
            id: ComponentId.new(),
            name: 'IsSelectedComponent',
            data: {},
          });
        }
      });
    },
  };
};

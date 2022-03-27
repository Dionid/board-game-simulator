import { System } from '../../../../ecs/system';
import {
  DraggableComponent,
  HandComponent,
  IsDraggingComponent,
  OwnerComponent,
  PlayerComponent,
  PositionComponent,
  SizeComponent,
} from '../../components';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';

export const DragSystem = (): System<{
  PlayerComponent: PlayerComponent;
  OwnerComponent: OwnerComponent;
  HandComponent: HandComponent;
  DraggableComponent: DraggableComponent;
  PositionComponent: PositionComponent;
  SizeComponent: SizeComponent;
  IsDraggingComponent: IsDraggingComponent;
}> => {
  const lastMousePosition = {
    x: 0,
    y: 0,
  };
  return {
    run: async (world) => {
      const playerMouseEntities = World.filter(world, ['PlayerComponent', 'OwnerComponent', 'HandComponent']);
      const draggableEntities = World.filter(world, ['DraggableComponent', 'PositionComponent', 'SizeComponent']);

      const isDraggingComponentsPool = World.getOrAddPool(world, 'IsDraggingComponent');

      const handPool = World.getOrAddPool(world, 'HandComponent');

      playerMouseEntities.forEach((playerMouseEntity) => {
        const playerMouseComponent = Pool.get(handPool, playerMouseEntity);
        // . IF MOUSE IS DOWN
        if (playerMouseComponent.data.down) {
          const positionCP = World.getOrAddPool(world, 'PositionComponent');
          const sizeCP = World.getOrAddPool(world, 'SizeComponent');
          draggableEntities.forEach((draggableEntity) => {
            const positionC = Pool.get(positionCP, draggableEntity);
            const sizeC = Pool.get(sizeCP, draggableEntity);

            if (
              playerMouseComponent.data.x > positionC.data.x &&
              playerMouseComponent.data.x < positionC.data.x + sizeC.data.width &&
              playerMouseComponent.data.y > positionC.data.y &&
              playerMouseComponent.data.y < positionC.data.y + sizeC.data.height
            ) {
              Pool.add(isDraggingComponentsPool, draggableEntity, {
                id: ComponentId.new(),
                name: 'IsDraggingComponent',
                data: {},
              });
            }
          });
        } else {
          // . IF MOUSE IS UP
          const isDraggingEntities = World.filter(world, ['IsDraggingComponent']);
          isDraggingEntities.forEach((isDraggingEntity) => {
            Pool.delete(isDraggingComponentsPool, isDraggingEntity);
          });
        }

        {
          const positionCP = World.getOrAddPool(world, 'PositionComponent');
          const isDraggingEntities = World.filter(world, ['IsDraggingComponent']);
          isDraggingEntities.forEach((isDraggingEntity) => {
            const positionComponent = Pool.get(positionCP, isDraggingEntity);
            if (lastMousePosition.x > playerMouseComponent.data.x) {
              positionComponent.data.x -= lastMousePosition.x - playerMouseComponent.data.x;
            } else {
              positionComponent.data.x += playerMouseComponent.data.x - lastMousePosition.x;
            }
            if (lastMousePosition.y > playerMouseComponent.data.y) {
              positionComponent.data.y -= lastMousePosition.y - playerMouseComponent.data.y;
            } else {
              positionComponent.data.y += playerMouseComponent.data.y - lastMousePosition.y;
            }
          });
        }

        lastMousePosition.y = playerMouseComponent.data.y;
        lastMousePosition.x = playerMouseComponent.data.x;
      });
    },
  };
};

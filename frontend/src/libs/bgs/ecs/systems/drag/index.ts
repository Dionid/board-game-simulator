import { System } from '../../../../ecs/system';
import {
  DraggableComponent,
  HandComponent,
  IsDraggingComponent,
  IsLockedComponent,
  IsSelectedComponent,
  OwnerComponent,
  PlayerComponent,
  PositionComponent,
} from '../../components';
import { World } from '../../../../ecs/world';
import { Pool } from '../../../../ecs/component';

export const DragSystem = (): System<{
  PlayerComponent: PlayerComponent;
  OwnerComponent: OwnerComponent;
  HandComponent: HandComponent;
  DraggableComponent: DraggableComponent;
  PositionComponent: PositionComponent;
  IsDraggingComponent: IsDraggingComponent;
  IsSelectedComponent: IsSelectedComponent;
  IsLockedComponent: IsLockedComponent;
}> => {
  return {
    run: async (props) => {
      const { world } = props;

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

        playerMouseEntities.forEach((playerMouseEntity) => {
          const playerMouseComponent = Pool.get(handPool, playerMouseEntity);
          if (playerMouseComponent.data.previous.x > playerMouseComponent.data.current.x) {
            positionC.data.x -= playerMouseComponent.data.previous.x - playerMouseComponent.data.current.x;
          } else {
            positionC.data.x += playerMouseComponent.data.current.x - playerMouseComponent.data.previous.x;
          }
          if (playerMouseComponent.data.previous.y > playerMouseComponent.data.current.y) {
            positionC.data.y -= playerMouseComponent.data.previous.y - playerMouseComponent.data.current.y;
          } else {
            positionC.data.y += playerMouseComponent.data.current.y - playerMouseComponent.data.previous.y;
          }
        });
      });
    },
  };
};

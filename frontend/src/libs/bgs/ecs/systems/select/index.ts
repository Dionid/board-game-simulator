import { System } from '../../../../ecs/system';
import {
  HandComponent,
  IsSelectedComponent,
  OwnerComponent,
  PlayerComponent,
  PositionComponent,
  SelectableComponent,
  SizeComponent,
} from '../../components';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';

export const SelectSystem = (): System<{
  HandComponent: HandComponent;
  PlayerComponent: PlayerComponent;
  OwnerComponent: OwnerComponent;
  SelectableComponent: SelectableComponent;
  IsSelectedComponent: IsSelectedComponent;
  PositionComponent: PositionComponent;
  SizeComponent: SizeComponent;
}> => {
  return {
    run: async (world) => {
      const playerMouseEntities = World.filter(world, ['PlayerComponent', 'OwnerComponent', 'HandComponent']);
      const selectableEntities = World.filter(world, ['SelectableComponent', 'PositionComponent', 'SizeComponent']);
      const isSelectedEntities = World.filter(world, ['IsSelectedComponent']);

      const isSelectedComponentsPool = World.getOrAddPool(world, 'IsSelectedComponent');

      const handPool = World.getOrAddPool(world, 'HandComponent');

      playerMouseEntities.forEach((playerMouseEntity) => {
        const playerMouseComponent = Pool.get(handPool, playerMouseEntity);

        // . IF MOUSE UP
        if (!playerMouseComponent.data.current.down) {
          if (isSelectedEntities.length) {
            isSelectedEntities.forEach((entity) => {
              Pool.delete(isSelectedComponentsPool, entity);
            });
          }
        } else if (playerMouseComponent.data.current.down && isSelectedEntities.length === 0) {
          const positionCP = World.getOrAddPool(world, 'PositionComponent');
          const sizeCP = World.getOrAddPool(world, 'SizeComponent');

          selectableEntities.forEach((selectableEntity) => {
            const positionC = Pool.get(positionCP, selectableEntity);
            const sizeC = Pool.get(sizeCP, selectableEntity);

            if (
              playerMouseComponent.data.current.x > positionC.data.x &&
              playerMouseComponent.data.current.x < positionC.data.x + sizeC.data.width &&
              playerMouseComponent.data.current.y > positionC.data.y &&
              playerMouseComponent.data.current.y < positionC.data.y + sizeC.data.height
            ) {
              Pool.add(isSelectedComponentsPool, selectableEntity, {
                id: ComponentId.new(),
                name: 'IsSelectedComponent',
                data: {},
              });
            }
          });
        }
      });
    },
  };
};

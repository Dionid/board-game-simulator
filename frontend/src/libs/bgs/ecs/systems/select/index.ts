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
import { EntityId } from '../../../../ecs/entity';

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
    run: async ({ world }) => {
      const selectableEntities = World.filter(world, ['SelectableComponent', 'PositionComponent', 'SizeComponent']);

      if (selectableEntities.length === 0) {
        return;
      }

      const playerMouseEntities = World.filter(world, ['PlayerComponent', 'OwnerComponent', 'HandComponent']);
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

          const mouseOnEntities: EntityId[] = [];

          selectableEntities.forEach((selectableEntity) => {
            const positionC = Pool.get(positionCP, selectableEntity);
            const sizeC = Pool.get(sizeCP, selectableEntity);
            if (
              playerMouseComponent.data.current.x > positionC.data.x &&
              playerMouseComponent.data.current.x < positionC.data.x + sizeC.data.width &&
              playerMouseComponent.data.current.y > positionC.data.y &&
              playerMouseComponent.data.current.y < positionC.data.y + sizeC.data.height
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

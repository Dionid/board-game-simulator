import { System } from '../../../../ecs/system';
import {
  HandComponent,
  IsSelectedComponent,
  OwnerComponent,
  PlayerComponent,
  PositionComponent,
  PositionComponentName,
  SelectableComponent,
  SizeComponent,
} from '../../components';
import { Essence } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import { Square } from '../../../../math';

export const SelectSystem = (): System<{
  HandComponent: HandComponent;
  PlayerComponent: PlayerComponent;
  OwnerComponent: OwnerComponent;
  SelectableComponent: SelectableComponent;
  IsSelectedComponent: IsSelectedComponent;
  SizeComponent: SizeComponent;
  [PositionComponentName]: PositionComponent;
}> => {
  return {
    run: async ({ essence }) => {
      const selectableEntities = Essence.filter(essence, ['SelectableComponent', 'PositionComponent', 'SizeComponent']);

      if (selectableEntities.length === 0) {
        return;
      }

      const playerMouseEntities = Essence.filter(essence, ['PlayerComponent', 'OwnerComponent', 'HandComponent']);
      const isSelectedEntities = Essence.filter(essence, ['IsSelectedComponent']);

      const isSelectedComponentsPool = Essence.getOrAddPool(essence, 'IsSelectedComponent');

      const handPool = Essence.getOrAddPool(essence, 'HandComponent');

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
          const positionCP = Essence.getOrAddPool(essence, 'PositionComponent');
          const sizeCP = Essence.getOrAddPool(essence, 'SizeComponent');

          const mouseOnEntities: EntityId[] = [];

          selectableEntities.forEach((selectableEntity) => {
            const positionC = Pool.get(positionCP, selectableEntity);
            const sizeC = Pool.get(sizeCP, selectableEntity);
            if (
              Square.isInside(
                {
                  ...positionC.data,
                  ...sizeC.data,
                },
                playerMouseComponent.data.onBoardPosition.current
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

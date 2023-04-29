import { System } from '../../../../ecs/system';
import {
  DepthComponent,
  DepthComponentName,
  HandComponent,
  HandComponentName,
  IsSelectedComponent,
  IsSelectedComponentName,
  OwnerComponent,
  OwnerComponentName,
  PlayerComponent,
  PlayerComponentName,
  PositionComponent,
  PositionComponentName,
  SelectableComponent,
  SelectableComponentName,
  SizeComponent,
  SizeComponentName,
} from '../../components';
import { Essence } from '../../../../ecs/essence';
import { ComponentId, Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import { Square } from '../../../../math';

export const SelectSystem = (): System<{
  [HandComponentName]: HandComponent;
  [DepthComponentName]: DepthComponent;
  [PlayerComponentName]: PlayerComponent;
  [OwnerComponentName]: OwnerComponent;
  [SelectableComponentName]: SelectableComponent;
  [IsSelectedComponentName]: IsSelectedComponent;
  [SizeComponentName]: SizeComponent;
  [PositionComponentName]: PositionComponent;
}> => {
  return {
    run: async ({ essence }) => {
      const selectableEntities = Essence.filter(essence, [
        SelectableComponentName,
        PositionComponentName,
        SizeComponentName,
      ]);

      if (selectableEntities.length === 0) {
        return;
      }

      const playerMouseEntities = Essence.filter(essence, [PlayerComponentName, OwnerComponentName, HandComponentName]);
      const isSelectedEntities = Essence.filter(essence, [IsSelectedComponentName]);

      const isSelectedComponentsPool = Essence.getOrAddPool(essence, IsSelectedComponentName);

      const handPool = Essence.getOrAddPool(essence, HandComponentName);

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
          const positionCP = Essence.getOrAddPool(essence, PositionComponentName);
          const sizeCP = Essence.getOrAddPool(essence, SizeComponentName);

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

          // let lastZIndex = 0;
          // const maxZPositionEntity = mouseOnEntities.reduce((prev, cur) => {
          //   const positionC = Pool.get(positionCP, cur);
          //
          //   if (positionC.data.z > lastZIndex) {
          //     lastZIndex = positionC.data.z;
          //     return cur;
          //   }
          //
          //   lastZIndex = positionC.data.z;
          //   return prev;
          // });

          // let lastZIndex = 0;
          // const maxZPositionEntity = mouseOnEntities.reduce((prev, cur) => {
          //
          //
          //   if (positionC.data.z > lastZIndex) {
          //     lastZIndex = positionC.data.z;
          //     return cur;
          //   }
          //
          //   lastZIndex = positionC.data.z;
          //   return prev;
          // });

          // TODO. REFACTORE TO SINGLETON
          const depthCP = Essence.getOrAddPool(essence, DepthComponentName);
          const depthE = Object.keys(depthCP.data).map((entity) => entity)[0] as EntityId;
          const depthC = Pool.get(depthCP, depthE);

          const filtered = depthC.data.list.filter((id) => mouseOnEntities.includes(id));

          const maxZPositionEntity = filtered[filtered.length - 1];

          Pool.add(isSelectedComponentsPool, maxZPositionEntity, {
            id: ComponentId.new(),
            name: IsSelectedComponentName,
            data: {},
          });
        }
      });
    },
  };
};

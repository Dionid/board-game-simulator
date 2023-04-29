import { System } from '../../../../ecs/system';
import {
  DepthComponent,
  DepthComponentName,
  DynamicDepthComponent,
  DynamicDepthComponentName,
  GameObjectComponent,
  GameObjectComponentName,
  IsSelectedComponent,
  IsSelectedComponentName,
} from '../../components';
import { Essence } from '../../../../ecs/essence';
import { ComponentId, Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';

export const DepthSystem = (): System<
  {
    [DepthComponentName]: DepthComponent;
    [DynamicDepthComponentName]: DynamicDepthComponent;
    [GameObjectComponentName]: GameObjectComponent;
    [IsSelectedComponentName]: IsSelectedComponent;
  },
  {
    forceUpdate: () => void;
  }
> => {
  const depthPoolEntityId = EntityId.new();
  return {
    init: async ({ essence }) => {
      const cp = Essence.getOrAddPool(essence, DepthComponentName);
      Pool.add(cp, depthPoolEntityId, {
        id: ComponentId.new(),
        name: DepthComponentName,
        data: {
          list: [],
        },
      });
    },
    run: async ({ essence, ctx }) => {
      const depthCP = Essence.getOrAddPool(essence, DepthComponentName);
      const depthC = Pool.get(depthCP, depthPoolEntityId);
      const { list } = depthC.data;

      {
        const goEntities = Essence.filter(essence, [GameObjectComponentName, DynamicDepthComponentName]);

        goEntities.forEach((goEntity) => {
          if (list.indexOf(goEntity) === -1) {
            list.push(goEntity);
            ctx.forceUpdate();
          }
        });
      }

      {
        const isSelectedComponents = Essence.filter(essence, [IsSelectedComponentName, DynamicDepthComponentName]);

        isSelectedComponents.forEach((entity) => {
          const index = list.indexOf(entity);
          if (index !== list.length - 1) {
            list.splice(index, 1);
            list.push(entity);
            ctx.forceUpdate();
          }
        });
      }
    },
  };
};

import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { ComponentId, Pool } from '../../../../ecs/component';
import {
  SpawnSideKickEventComponent,
  SpawnGameObjectEventComponent,
  SidekickComponent,
  CameraComponentName,
  CameraComponent,
  PlayerComponentName,
  PlayerComponent,
  PositionComponentName,
  PositionComponent,
  SizeComponentName,
  SizeComponent,
  ViewChangeableComponentName,
  SpawnGameObjectEventComponentName,
  SpawnSideKickEventComponentName,
  SidekickComponentName,
  ViewChangeableComponent,
} from '../../components';

export const SpawnSidekickEventSystem = (): System<{
  [SpawnSideKickEventComponentName]: SpawnSideKickEventComponent;
  [SidekickComponentName]: SidekickComponent;
  [SpawnGameObjectEventComponentName]: SpawnGameObjectEventComponent;
  [CameraComponentName]: CameraComponent;
  [PlayerComponentName]: PlayerComponent;
  [PositionComponentName]: PositionComponent;
  [SizeComponentName]: SizeComponent;
  [ViewChangeableComponentName]: ViewChangeableComponent;
}> => {
  return {
    run: async ({ essence }) => {
      const entities = Essence.filter(essence, [SpawnSideKickEventComponentName]);
      if (entities.length === 0) {
        return;
      }

      const spawnSidekickComponentPool = Essence.getOrAddPool(essence, SpawnSideKickEventComponentName);
      const sidekickComponentPool = Essence.getOrAddPool(essence, SidekickComponentName);
      const spawnGameObjectComponentPool = Essence.getOrAddPool(essence, SpawnGameObjectEventComponentName);
      const viewChangeableCP = Essence.getOrAddPool(essence, ViewChangeableComponentName);

      for (const sidekickEntity of entities) {
        const spawnComponent = Pool.get(spawnSidekickComponentPool, sidekickEntity);

        // TODO. Think about entity id: must be new or the same
        // . Create sidekick spawn event
        const size = {
          width: 50,
          height: 90,
        };
        Pool.add(spawnGameObjectComponentPool, sidekickEntity, {
          id: ComponentId.new(),
          name: 'SpawnGameObjectEventComponent',
          data: {
            imageUrl: spawnComponent.data.views[0].url,
            draggable: true,
            selectable: true,
            lockable: true,
            deletable: false,
            x: spawnComponent.data.x - size.width / 2,
            y: spawnComponent.data.y - size.height / 2,
            ...size,
          },
        });

        if (spawnComponent.data.views.length > 1) {
          Pool.add(viewChangeableCP, sidekickEntity, {
            id: ComponentId.new(),
            name: ViewChangeableComponentName,
            data: {
              current: 0,
              views: spawnComponent.data.views,
            },
          });
        }

        Pool.add(sidekickComponentPool, sidekickEntity, {
          id: ComponentId.new(),
          name: 'SidekickComponent',
          data: {
            heroSetEntityId: spawnComponent.data.heroSetEntityId,
            sidekickId: spawnComponent.data.sidekickId,
          },
        });

        // Destroy event
        Pool.delete(spawnSidekickComponentPool, sidekickEntity);
      }
    },
  };
};

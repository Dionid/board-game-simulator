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
} from '../../components';

export const SpawnSidekickEventSystem = (): System<{
  SpawnSideKickEventComponent: SpawnSideKickEventComponent;
  SidekickComponent: SidekickComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
  [CameraComponentName]: CameraComponent;
  [PlayerComponentName]: PlayerComponent;
  [PositionComponentName]: PositionComponent;
  [SizeComponentName]: SizeComponent;
}> => {
  return {
    run: async ({ essence }) => {
      const entities = Essence.filter(essence, ['SpawnSideKickEventComponent']);
      if (entities.length === 0) {
        return;
      }

      const spawnSidekickComponentPool = Essence.getOrAddPool(essence, 'SpawnSideKickEventComponent');
      const sidekickComponentPool = Essence.getOrAddPool(essence, 'SidekickComponent');
      const spawnGameObjectComponentPool = Essence.getOrAddPool(essence, 'SpawnGameObjectEventComponent');

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
            imageUrl: spawnComponent.data.url,
            draggable: true,
            selectable: true,
            lockable: true,
            deletable: false,
            x: spawnComponent.data.x - size.width / 2,
            y: spawnComponent.data.y - size.height / 2,
            ...size,
          },
        });

        Pool.add(sidekickComponentPool, sidekickEntity, {
          id: ComponentId.new(),
          name: 'SidekickComponent',
          data: {
            sidekickId: spawnComponent.data.sidekickId,
          },
        });

        // Destroy event
        Pool.delete(spawnSidekickComponentPool, sidekickEntity);
      }
    },
  };
};

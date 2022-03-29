import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import {
  SpawnSideKickEventComponent,
  SpawnGameObjectEventComponent,
  SidekickComponent,
  CameraComponentName,
  CameraComponent,
  PlayerComponentName,
  PlayerComponent,
} from '../../components';
import { Camera } from '../../../../game-engine';

export const SpawnSidekickEventSystem = (): System<{
  SpawnSideKickEventComponent: SpawnSideKickEventComponent;
  SidekickComponent: SidekickComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
  [CameraComponentName]: CameraComponent;
  [PlayerComponentName]: PlayerComponent;
}> => {
  return {
    run: async ({ world }) => {
      const entities = World.filter(world, ['SpawnSideKickEventComponent']);
      if (entities.length === 0) {
        return;
      }

      const playerEntities = World.filter(world, ['PlayerComponent', 'CameraComponent']);
      const cameraComponentPool = World.getOrAddPool(world, 'CameraComponent');

      // TODO. Refactor for collaboration
      const playerEntity = playerEntities[0];
      const cameraC = Pool.get(cameraComponentPool, playerEntity);

      const spawnSidekickComponentPool = World.getOrAddPool(world, 'SpawnSideKickEventComponent');
      const sidekickComponentPool = World.getOrAddPool(world, 'SidekickComponent');
      const spawnGameObjectComponentPool = World.getOrAddPool(world, 'SpawnGameObjectEventComponent');

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
            ...size,
            ...Camera.inCameraView(cameraC.data, {
              x: cameraC.data.width / 2 - size.width / 2,
              y: cameraC.data.height / 2 - size.height / 2,
            }),
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

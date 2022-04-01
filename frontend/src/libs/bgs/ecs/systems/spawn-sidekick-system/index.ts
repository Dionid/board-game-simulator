import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/world';
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
import { Vector2 } from '../../../../math';

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

      const playerEntities = Essence.filter(essence, ['PlayerComponent', 'CameraComponent']);
      const cameraPositionComponentPool = Essence.getOrAddPool(essence, 'PositionComponent');
      const cameraSizeComponentPool = Essence.getOrAddPool(essence, 'SizeComponent');

      // TODO. Refactor for collaboration
      const playerEntity = playerEntities[0];
      const cameraPositionC = Pool.get(cameraPositionComponentPool, playerEntity);
      const cameraSizeC = Pool.get(cameraSizeComponentPool, playerEntity);

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
            ...size,
            ...Vector2.sum(cameraPositionC.data, {
              x: cameraSizeC.data.width / 2 - size.width / 2,
              y: cameraSizeC.data.height / 2 - size.height / 2,
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

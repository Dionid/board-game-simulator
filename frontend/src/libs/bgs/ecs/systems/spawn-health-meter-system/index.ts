import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import {
  HealthMeterComponent,
  SpawnHealthMeterEventComponent,
  SpawnGameObjectEventComponent,
  CameraComponentName,
  CameraComponent,
  PlayerComponentName,
  PlayerComponent,
} from '../../components';
import { Camera } from '../../../../game-engine';

export const SpawnHealthMeterEventSystem = (): System<{
  SpawnHealthMeterEventComponent: SpawnHealthMeterEventComponent;
  HealthMeterComponent: HealthMeterComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
  [CameraComponentName]: CameraComponent;
  [PlayerComponentName]: PlayerComponent;
}> => {
  return {
    run: async ({ world }) => {
      const entities = World.filter(world, ['SpawnHealthMeterEventComponent']);
      if (entities.length === 0) {
        return;
      }

      const playerEntities = World.filter(world, ['PlayerComponent', 'CameraComponent']);
      const cameraComponentPool = World.getOrAddPool(world, 'CameraComponent');

      // TODO. Refactor for collaboration
      const playerEntity = playerEntities[0];
      const cameraC = Pool.get(cameraComponentPool, playerEntity);

      const spawnHealthMeterComponentPool = World.getOrAddPool(world, 'SpawnHealthMeterEventComponent');
      const deckComponentPool = World.getOrAddPool(world, 'HealthMeterComponent');
      const spawnGameObjectComponentPool = World.getOrAddPool(world, 'SpawnGameObjectEventComponent');

      for (const deckEntity of entities) {
        const spawnComponent = Pool.get(spawnHealthMeterComponentPool, deckEntity);

        // TODO. Think about entity id: must be new or the same
        // . Create deck spawn event
        const size = {
          width: 140,
          height: 140,
        };
        Pool.add(spawnGameObjectComponentPool, deckEntity, {
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

        Pool.add(deckComponentPool, deckEntity, {
          id: ComponentId.new(),
          name: 'HealthMeterComponent',
          data: {
            healthMeterId: spawnComponent.data.healthMeterId,
          },
        });

        // Destroy event
        Pool.delete(spawnHealthMeterComponentPool, deckEntity);
      }
    },
  };
};

import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import {
  HealthMeterComponent,
  SpawnHealthMeterEventComponent,
  SpawnGameObjectEventComponent,
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

export const SpawnHealthMeterEventSystem = (): System<{
  SpawnHealthMeterEventComponent: SpawnHealthMeterEventComponent;
  HealthMeterComponent: HealthMeterComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
  [CameraComponentName]: CameraComponent;
  [PlayerComponentName]: PlayerComponent;
  [PositionComponentName]: PositionComponent;
  [SizeComponentName]: SizeComponent;
}> => {
  return {
    run: async ({ essence }) => {
      const entities = Essence.filter(essence, ['SpawnHealthMeterEventComponent']);
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

      const spawnHealthMeterComponentPool = Essence.getOrAddPool(essence, 'SpawnHealthMeterEventComponent');
      const deckComponentPool = Essence.getOrAddPool(essence, 'HealthMeterComponent');
      const spawnGameObjectComponentPool = Essence.getOrAddPool(essence, 'SpawnGameObjectEventComponent');

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
            ...Vector2.sum(cameraPositionC.data, {
              x: cameraSizeC.data.width / 2 - size.width / 2,
              y: cameraSizeC.data.height / 2 - size.height / 2,
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

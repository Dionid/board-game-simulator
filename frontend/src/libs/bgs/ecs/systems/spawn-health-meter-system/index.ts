import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
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
  HealthMeterComponentName,
  SpawnGameObjectEventComponentName,
  SpawnHealthMeterEventComponentName,
} from '../../components';

export const SpawnHealthMeterEventSystem = (): System<{
  [SpawnHealthMeterEventComponentName]: SpawnHealthMeterEventComponent;
  [HealthMeterComponentName]: HealthMeterComponent;
  [SpawnGameObjectEventComponentName]: SpawnGameObjectEventComponent;
  [CameraComponentName]: CameraComponent;
  [PlayerComponentName]: PlayerComponent;
  [PositionComponentName]: PositionComponent;
  [SizeComponentName]: SizeComponent;
}> => {
  return {
    run: async ({ essence }) => {
      const entities = Essence.filter(essence, [SpawnHealthMeterEventComponentName]);
      if (entities.length === 0) {
        return;
      }

      const spawnHealthMeterComponentPool = Essence.getOrAddPool(essence, SpawnHealthMeterEventComponentName);
      const deckComponentPool = Essence.getOrAddPool(essence, HealthMeterComponentName);
      const spawnGameObjectComponentPool = Essence.getOrAddPool(essence, SpawnGameObjectEventComponentName);

      for (const healthMeterEntity of entities) {
        const spawnComponent = Pool.get(spawnHealthMeterComponentPool, healthMeterEntity);

        // TODO. Think about entity id: must be new or the same
        // . Create deck spawn event
        const size = {
          width: 140,
          height: 140,
        };
        Pool.add(spawnGameObjectComponentPool, healthMeterEntity, {
          id: ComponentId.new(),
          name: SpawnGameObjectEventComponentName,
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

        Pool.add(deckComponentPool, healthMeterEntity, {
          id: ComponentId.new(),
          name: HealthMeterComponentName,
          data: {
            heroSetEntityId: spawnComponent.data.heroSetEntityId,
            healthMeterId: spawnComponent.data.healthMeterId,
          },
        });

        // Destroy event
        Pool.delete(spawnHealthMeterComponentPool, healthMeterEntity);
      }
    },
  };
};

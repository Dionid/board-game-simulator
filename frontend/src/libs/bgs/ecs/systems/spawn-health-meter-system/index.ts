import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { HealthMeterComponent, SpawnHealthMeterEventComponent, SpawnGameObjectEventComponent } from '../../components';

export const SpawnHealthMeterEventSystem = (): System<{
  SpawnHealthMeterEventComponent: SpawnHealthMeterEventComponent;
  HealthMeterComponent: HealthMeterComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
}> => {
  return {
    run: async ({ world }) => {
      const entities = World.filter(world, ['SpawnHealthMeterEventComponent']);
      if (entities.length === 0) {
        return;
      }

      const spawnHealthMeterComponentPool = World.getOrAddPool(world, 'SpawnHealthMeterEventComponent');
      const deckComponentPool = World.getOrAddPool(world, 'HealthMeterComponent');
      const spawnGameObjectComponentPool = World.getOrAddPool(world, 'SpawnGameObjectEventComponent');

      for (const deckEntity of entities) {
        const spawnComponent = Pool.get(spawnHealthMeterComponentPool, deckEntity);

        // TODO. Think about entity id: must be new or the same
        // . Create deck spawn event
        Pool.add(spawnGameObjectComponentPool, deckEntity, {
          id: ComponentId.new(),
          name: 'SpawnGameObjectEventComponent',
          data: {
            imageUrl: spawnComponent.data.url,
            x: 100,
            y: 100,
            width: 140,
            height: 140,
            draggable: true,
            selectable: true,
            lockable: true,
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

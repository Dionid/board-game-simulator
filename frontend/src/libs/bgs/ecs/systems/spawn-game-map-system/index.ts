import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { SpawnGameMapComponent, SpawnGameObjectEventComponent } from '../../components';

export const SpawnGameMapSystem = (): System<{
  SpawnGameMapComponent: SpawnGameMapComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
}> => ({
  run: async ({ world }) => {
    const entities = World.filter(world, ['SpawnGameMapComponent']);
    if (entities.length === 0) {
      return;
    }

    const spawnGameMapComponentPool = World.getOrAddPool(world, 'SpawnGameMapComponent');
    const spawnGameObjectComponentPool = World.getOrAddPool(world, 'SpawnGameObjectEventComponent');

    for (const mapEntity of entities) {
      const spawnComponent = Pool.get(spawnGameMapComponentPool, mapEntity);

      // . Create react game map
      Pool.add(spawnGameObjectComponentPool, mapEntity, {
        id: ComponentId.new(),
        name: 'SpawnGameObjectEventComponent',
        data: {
          imageUrl: spawnComponent.data.url,
          x: 100,
          y: 100,
          width: 750,
          height: 500,
          draggable: true,
          selectable: true,
        },
      });

      // . Destroy event
      Pool.delete(spawnGameMapComponentPool, mapEntity);
    }
  },
});

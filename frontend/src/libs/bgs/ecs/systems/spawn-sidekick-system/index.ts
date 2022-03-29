import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { SpawnSideKickEventComponent, SpawnGameObjectEventComponent, SidekickComponent } from '../../components';

export const SpawnSidekickEventSystem = (): System<{
  SpawnSideKickEventComponent: SpawnSideKickEventComponent;
  SidekickComponent: SidekickComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
}> => {
  return {
    run: async ({ world }) => {
      const entities = World.filter(world, ['SpawnSideKickEventComponent']);
      if (entities.length === 0) {
        return;
      }

      const spawnSidekickComponentPool = World.getOrAddPool(world, 'SpawnSideKickEventComponent');
      const sidekickComponentPool = World.getOrAddPool(world, 'SidekickComponent');
      const spawnGameObjectComponentPool = World.getOrAddPool(world, 'SpawnGameObjectEventComponent');

      for (const sidekickEntity of entities) {
        const spawnComponent = Pool.get(spawnSidekickComponentPool, sidekickEntity);

        // TODO. Think about entity id: must be new or the same
        // . Create sidekick spawn event
        Pool.add(spawnGameObjectComponentPool, sidekickEntity, {
          id: ComponentId.new(),
          name: 'SpawnGameObjectEventComponent',
          data: {
            imageUrl: spawnComponent.data.url,
            x: 100,
            y: 100,
            width: 50,
            height: 90,
            draggable: true,
            selectable: true,
            lockable: true,
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

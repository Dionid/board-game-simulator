import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { SpawnHeroComponent, SpawnGameObjectEventComponent, HeroComponent } from '../../components';

export const SpawnHeroSystem = (): System<{
  SpawnHeroComponent: SpawnHeroComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
  HeroComponent: HeroComponent;
}> => {
  return {
    run: async ({ world }) => {
      const entities = World.filter(world, ['SpawnHeroComponent']);
      if (entities.length === 0) {
        return;
      }

      const spawnHeroComponentPool = World.getOrAddPool(world, 'SpawnHeroComponent');
      const spawnGameObjectComponentPool = World.getOrAddPool(world, 'SpawnGameObjectEventComponent');
      const heroComponentPool = World.getOrAddPool(world, 'HeroComponent');

      for (const heroEntity of entities) {
        const spawnComponent = Pool.get(spawnHeroComponentPool, heroEntity);

        // TODO. Think about entity id: must be new or the same
        // . Create hero spawn event
        Pool.add(spawnGameObjectComponentPool, heroEntity, {
          id: ComponentId.new(),
          name: 'SpawnGameObjectEventComponent',
          data: {
            imageUrl: spawnComponent.data.url,
            x: 100,
            y: 100,
            width: 60,
            height: 100,
            draggable: true,
            selectable: true,
            lockable: true,
            deletable: false,
          },
        });

        Pool.add(heroComponentPool, heroEntity, {
          id: ComponentId.new(),
          name: 'HeroComponent',
          data: {
            heroId: spawnComponent.data.heroId,
          },
        });

        // Destroy event
        Pool.delete(spawnHeroComponentPool, heroEntity);
      }
    },
  };
};

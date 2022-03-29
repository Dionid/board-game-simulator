import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import {
  SpawnHeroComponent,
  SpawnGameObjectEventComponent,
  HeroComponent,
  CameraComponentName,
  CameraComponent,
  PlayerComponentName,
  PlayerComponent,
} from '../../components';
import { Camera } from '../../../../game-engine';

export const SpawnHeroSystem = (): System<{
  SpawnHeroComponent: SpawnHeroComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
  HeroComponent: HeroComponent;
  [CameraComponentName]: CameraComponent;
  [PlayerComponentName]: PlayerComponent;
}> => {
  return {
    run: async ({ world }) => {
      const entities = World.filter(world, ['SpawnHeroComponent']);
      if (entities.length === 0) {
        return;
      }

      const playerEntities = World.filter(world, ['PlayerComponent', 'CameraComponent']);
      const cameraComponentPool = World.getOrAddPool(world, 'CameraComponent');

      // TODO. Refactor for collaboration
      const playerEntity = playerEntities[0];
      const cameraC = Pool.get(cameraComponentPool, playerEntity);

      const spawnHeroComponentPool = World.getOrAddPool(world, 'SpawnHeroComponent');
      const spawnGameObjectComponentPool = World.getOrAddPool(world, 'SpawnGameObjectEventComponent');
      const heroComponentPool = World.getOrAddPool(world, 'HeroComponent');

      for (const heroEntity of entities) {
        const spawnComponent = Pool.get(spawnHeroComponentPool, heroEntity);

        // TODO. Think about entity id: must be new or the same
        // . Create hero spawn event
        const size = {
          width: 60,
          height: 100,
        };
        Pool.add(spawnGameObjectComponentPool, heroEntity, {
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

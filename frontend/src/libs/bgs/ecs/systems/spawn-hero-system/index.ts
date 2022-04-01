import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { ComponentId, Pool } from '../../../../ecs/component';
import {
  SpawnHeroEventComponent,
  SpawnGameObjectEventComponent,
  HeroComponent,
  CameraComponentName,
  CameraComponent,
  PlayerComponentName,
  PlayerComponent,
  PositionComponentName,
  PositionComponent,
  SizeComponentName,
  SizeComponent,
  SpawnHeroEventComponentName,
} from '../../components';
import { Vector2 } from '../../../../math';

export const SpawnHeroSystem = (): System<{
  [SpawnHeroEventComponentName]: SpawnHeroEventComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
  HeroComponent: HeroComponent;
  [CameraComponentName]: CameraComponent;
  [PlayerComponentName]: PlayerComponent;
  [PositionComponentName]: PositionComponent;
  [SizeComponentName]: SizeComponent;
}> => {
  return {
    run: async ({ essence }) => {
      const entities = Essence.filter(essence, [SpawnHeroEventComponentName]);
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

      const spawnHeroComponentPool = Essence.getOrAddPool(essence, SpawnHeroEventComponentName);
      const spawnGameObjectComponentPool = Essence.getOrAddPool(essence, 'SpawnGameObjectEventComponent');
      const heroComponentPool = Essence.getOrAddPool(essence, 'HeroComponent');

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
            ...Vector2.sum(cameraPositionC.data, {
              x: cameraSizeC.data.width / 2 - size.width / 2,
              y: cameraSizeC.data.height / 2 - size.height / 2,
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

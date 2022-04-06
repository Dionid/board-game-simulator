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
  SpawnGameObjectEventComponentName,
  HeroComponentName,
  ViewChangeableComponentName,
  ViewChangeableComponent,
} from '../../components';

export const SpawnHeroSystem = (): System<{
  [SpawnHeroEventComponentName]: SpawnHeroEventComponent;
  [SpawnGameObjectEventComponentName]: SpawnGameObjectEventComponent;
  [HeroComponentName]: HeroComponent;
  [CameraComponentName]: CameraComponent;
  [PlayerComponentName]: PlayerComponent;
  [PositionComponentName]: PositionComponent;
  [SizeComponentName]: SizeComponent;
  [ViewChangeableComponentName]: ViewChangeableComponent;
}> => {
  return {
    run: async ({ essence }) => {
      const entities = Essence.filter(essence, [SpawnHeroEventComponentName]);
      if (entities.length === 0) {
        return;
      }

      const spawnHeroComponentPool = Essence.getOrAddPool(essence, SpawnHeroEventComponentName);
      const spawnGameObjectComponentPool = Essence.getOrAddPool(essence, SpawnGameObjectEventComponentName);
      const heroComponentPool = Essence.getOrAddPool(essence, HeroComponentName);
      const viewChangeableCP = Essence.getOrAddPool(essence, ViewChangeableComponentName);

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
          name: SpawnGameObjectEventComponentName,
          data: {
            imageUrl: spawnComponent.data.views[0].url,
            draggable: true,
            selectable: true,
            lockable: true,
            deletable: false,
            x: spawnComponent.data.x - size.width / 2,
            y: spawnComponent.data.y - size.height / 2,
            ...size,
          },
        });

        if (spawnComponent.data.views.length > 1) {
          Pool.add(viewChangeableCP, heroEntity, {
            id: ComponentId.new(),
            name: ViewChangeableComponentName,
            data: {
              current: 0,
              views: spawnComponent.data.views,
            },
          });
        }

        Pool.add(heroComponentPool, heroEntity, {
          id: ComponentId.new(),
          name: HeroComponentName,
          data: {
            heroSetEntityId: spawnComponent.data.heroSetEntityId,
            heroId: spawnComponent.data.heroId,
          },
        });

        // Destroy event
        Pool.delete(spawnHeroComponentPool, heroEntity);
      }
    },
  };
};

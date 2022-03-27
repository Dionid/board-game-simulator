import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import {
  ImageComponent,
  PositionComponent,
  SpawnHeroComponent,
  ReactHeroComponent,
  SizeComponent,
} from '../../components';

export const SpawnHeroSystem = (): System<{
  SpawnHeroComponent: SpawnHeroComponent;
  ReactHeroComponent: ReactHeroComponent;
  ImageComponent: ImageComponent;
  PositionComponent: PositionComponent;
  SizeComponent: SizeComponent;
}> => ({
  run: async (world) => {
    const entities = World.filter(world, ['SpawnHeroComponent']);
    if (entities.length === 0) {
      return;
    }

    const spawnHeroComponentPool = World.getOrAddPool(world, 'SpawnHeroComponent');
    const reactHeroComponentPool = World.getOrAddPool(world, 'ReactHeroComponent');
    const imageComponentPool = World.getOrAddPool(world, 'ImageComponent');
    const positionComponentPool = World.getOrAddPool(world, 'PositionComponent');
    const sizeComponentPool = World.getOrAddPool(world, 'SizeComponent');

    for (const entity of entities) {
      const spawnComponent = Pool.get(spawnHeroComponentPool, entity);
      const heroEntity = EntityId.new();
      // . Create react game map
      Pool.add(reactHeroComponentPool, heroEntity, {
        id: ComponentId.new(),
        name: 'ReactHeroComponent',
        data: {},
      });
      Pool.add(imageComponentPool, heroEntity, {
        id: ComponentId.new(),
        name: 'ImageComponent',
        data: {
          url: spawnComponent.data.url,
        },
      });
      Pool.add(positionComponentPool, heroEntity, {
        id: ComponentId.new(),
        name: 'PositionComponent',
        data: {
          x: 100,
          y: 100,
          z: 100,
        },
      });
      Pool.add(sizeComponentPool, heroEntity, {
        id: ComponentId.new(),
        name: 'SizeComponent',
        data: {
          width: 60,
          height: 100,
        },
      });
      // . Destroy component
      Pool.delete(spawnHeroComponentPool, entity);
    }
  },
});

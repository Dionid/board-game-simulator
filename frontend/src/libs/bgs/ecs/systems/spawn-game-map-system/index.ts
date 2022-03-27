import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import { ImageComponent, PositionComponent, SpawnGameMapComponent, ReactGameMapComponent } from '../../components';

export const SpawnGameMapSystem = (): System<{
  SpawnGameMapComponent: SpawnGameMapComponent;
  ReactGameMapComponent: ReactGameMapComponent;
  ImageComponent: ImageComponent;
  PositionComponent: PositionComponent;
}> => ({
  run: async (world) => {
    const entities = World.filter(world, ['SpawnGameMapComponent']);
    if (entities.length === 0) {
      return;
    }

    const spawnGameMapComponentPool = World.getOrAddPool(world, 'SpawnGameMapComponent');
    const reactGameMapComponentPool = World.getOrAddPool(world, 'ReactGameMapComponent');
    const imageComponentPool = World.getOrAddPool(world, 'ImageComponent');
    const positionComponentPool = World.getOrAddPool(world, 'PositionComponent');

    for (const entity of entities) {
      const spawnComponent = Pool.get(spawnGameMapComponentPool, entity);
      const mapEntity = EntityId.new();
      // . Create react game map
      Pool.add(reactGameMapComponentPool, mapEntity, {
        id: ComponentId.new(),
        name: 'ReactGameMapComponent',
        data: {},
      });
      Pool.add(imageComponentPool, mapEntity, {
        id: ComponentId.new(),
        name: 'ImageComponent',
        data: {
          url: spawnComponent.data.url,
        },
      });
      Pool.add(positionComponentPool, mapEntity, {
        id: ComponentId.new(),
        name: 'PositionComponent',
        data: {
          x: 100,
          y: 100,
          z: 100,
        },
      });
      // . Destroy component
      Pool.delete(spawnGameMapComponentPool, entity);
    }
  },
});

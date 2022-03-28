import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import {
  ImageComponent,
  PositionComponent,
  SpawnGameMapComponent,
  ReactGameMapComponent,
  SizeComponent,
  DraggableComponent,
  SelectableComponent,
} from '../../components';

export const SpawnGameMapSystem = (): System<{
  SpawnGameMapComponent: SpawnGameMapComponent;
  ReactGameMapComponent: ReactGameMapComponent;
  ImageComponent: ImageComponent;
  PositionComponent: PositionComponent;
  SizeComponent: SizeComponent;
  DraggableComponent: DraggableComponent;
  SelectableComponent: SelectableComponent;
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
    const sizeComponentPool = World.getOrAddPool(world, 'SizeComponent');
    const draggableComponentPool = World.getOrAddPool(world, 'DraggableComponent');
    const selectableComponentPool = World.getOrAddPool(world, 'SelectableComponent');

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
          z: 0,
        },
      });
      Pool.add(sizeComponentPool, mapEntity, {
        id: ComponentId.new(),
        name: 'SizeComponent',
        data: {
          width: 750,
          height: 500,
        },
      });
      Pool.add(draggableComponentPool, mapEntity, {
        id: ComponentId.new(),
        name: 'DraggableComponent',
        data: {},
      });
      Pool.add(selectableComponentPool, mapEntity, {
        id: ComponentId.new(),
        name: 'SelectableComponent',
        data: {},
      });
      // . Destroy component
      Pool.delete(spawnGameMapComponentPool, entity);
    }
  },
});

import { System } from '../../../../ecs/system';
import {
  PositionComponent,
  ImageComponent,
  SpawnGameObjectEventComponent,
  DraggableComponent,
  SizeComponent,
  SelectableComponent,
  GameObjectComponent,
  LockableComponent,
  DeletableComponent,
} from '../../components';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';

export const SpawnGameObjectSystem = (): System<{
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
  ImageComponent: ImageComponent;
  PositionComponent: PositionComponent;
  SizeComponent: SizeComponent;
  DraggableComponent: DraggableComponent;
  SelectableComponent: SelectableComponent;
  LockableComponent: LockableComponent;
  GameObjectComponent: GameObjectComponent;
  DeletableComponent: DeletableComponent;
}> => {
  let lastZ = 1;

  return {
    run: async ({ world }) => {
      const entities = World.filter(world, ['SpawnGameObjectEventComponent']);

      if (entities.length === 0) {
        return;
      }

      const spawnGameObjectComponentPool = World.getOrAddPool(world, 'SpawnGameObjectEventComponent');
      const imageComponentPool = World.getOrAddPool(world, 'ImageComponent');
      const positionComponentPool = World.getOrAddPool(world, 'PositionComponent');
      const sizeComponentPool = World.getOrAddPool(world, 'SizeComponent');
      const draggableComponentPool = World.getOrAddPool(world, 'DraggableComponent');
      const selectableComponentPool = World.getOrAddPool(world, 'SelectableComponent');
      const lockableComponentPool = World.getOrAddPool(world, 'LockableComponent');
      const deletableComponentPool = World.getOrAddPool(world, 'DeletableComponent');
      const gameObjectComponentPool = World.getOrAddPool(world, 'GameObjectComponent');

      for (const gameObjectEntity of entities) {
        const spawnComponent = Pool.get(spawnGameObjectComponentPool, gameObjectEntity);

        Pool.add(gameObjectComponentPool, gameObjectEntity, {
          id: ComponentId.new(),
          name: 'GameObjectComponent',
          data: {},
        });

        // . Create react game map
        Pool.add(imageComponentPool, gameObjectEntity, {
          id: ComponentId.new(),
          name: 'ImageComponent',
          data: {
            url: spawnComponent.data.imageUrl,
          },
        });

        Pool.add(positionComponentPool, gameObjectEntity, {
          id: ComponentId.new(),
          name: 'PositionComponent',
          data: {
            x: spawnComponent.data.x,
            y: spawnComponent.data.y,
            z: lastZ + 1,
          },
        });

        Pool.add(sizeComponentPool, gameObjectEntity, {
          id: ComponentId.new(),
          name: 'SizeComponent',
          data: {
            width: spawnComponent.data.width,
            height: spawnComponent.data.height,
          },
        });

        if (spawnComponent.data.selectable) {
          Pool.add(selectableComponentPool, gameObjectEntity, {
            id: ComponentId.new(),
            name: 'SelectableComponent',
            data: {},
          });
        }

        if (spawnComponent.data.draggable) {
          Pool.add(draggableComponentPool, gameObjectEntity, {
            id: ComponentId.new(),
            name: 'DraggableComponent',
            data: {},
          });
        }

        if (spawnComponent.data.lockable) {
          Pool.add(lockableComponentPool, gameObjectEntity, {
            id: ComponentId.new(),
            name: 'LockableComponent',
            data: {},
          });
        }

        if (spawnComponent.data.deletable) {
          Pool.add(deletableComponentPool, gameObjectEntity, {
            id: ComponentId.new(),
            name: 'DeletableComponent',
            data: {},
          });
        }

        // . Destroy event
        Pool.delete(spawnGameObjectComponentPool, gameObjectEntity);

        lastZ += 1;
      }
    },
  };
};

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
import { Essence } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';

export const SpawnGameObjectSystem = (): System<
  {
    SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
    ImageComponent: ImageComponent;
    PositionComponent: PositionComponent;
    SizeComponent: SizeComponent;
    DraggableComponent: DraggableComponent;
    SelectableComponent: SelectableComponent;
    LockableComponent: LockableComponent;
    GameObjectComponent: GameObjectComponent;
    DeletableComponent: DeletableComponent;
  },
  {
    forceUpdate: () => void;
  }
> => {
  let lastZ = 1;

  return {
    run: async ({ essence, ctx }) => {
      const entities = Essence.filter(essence, ['SpawnGameObjectEventComponent']);

      if (entities.length === 0) {
        return;
      }

      const spawnGameObjectComponentPool = Essence.getOrAddPool(essence, 'SpawnGameObjectEventComponent');
      const imageComponentPool = Essence.getOrAddPool(essence, 'ImageComponent');
      const positionComponentPool = Essence.getOrAddPool(essence, 'PositionComponent');
      const sizeComponentPool = Essence.getOrAddPool(essence, 'SizeComponent');
      const draggableComponentPool = Essence.getOrAddPool(essence, 'DraggableComponent');
      const selectableComponentPool = Essence.getOrAddPool(essence, 'SelectableComponent');
      const lockableComponentPool = Essence.getOrAddPool(essence, 'LockableComponent');
      const deletableComponentPool = Essence.getOrAddPool(essence, 'DeletableComponent');
      const gameObjectComponentPool = Essence.getOrAddPool(essence, 'GameObjectComponent');

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

        ctx.forceUpdate();

        lastZ += 1;
      }
    },
  };
};

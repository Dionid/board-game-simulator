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
  SpawnGameObjectEventComponentName,
  ImageComponentName,
  SizeComponentName,
  PositionComponentName,
  DraggableComponentName,
  SelectableComponentName,
  LockableComponentName,
  DeletableComponentName,
  GameObjectComponentName,
  DynamicDepthComponent,
  DynamicDepthComponentName,
} from '../../components';
import { Essence } from '../../../../ecs/essence';
import { ComponentId, Pool } from '../../../../ecs/component';

export const SpawnGameObjectSystem = (): System<
  {
    [SpawnGameObjectEventComponentName]: SpawnGameObjectEventComponent;
    [ImageComponentName]: ImageComponent;
    [PositionComponentName]: PositionComponent;
    [SizeComponentName]: SizeComponent;
    [DraggableComponentName]: DraggableComponent;
    [SelectableComponentName]: SelectableComponent;
    [LockableComponentName]: LockableComponent;
    [GameObjectComponentName]: GameObjectComponent;
    [DeletableComponentName]: DeletableComponent;
    [DynamicDepthComponentName]: DynamicDepthComponent;
  },
  {
    forceUpdate: () => void;
  }
> => {
  let lastZ = 1;

  return {
    run: async ({ essence, ctx }) => {
      const entities = Essence.getEntitiesByComponents(essence, [SpawnGameObjectEventComponentName]);

      if (entities.length === 0) {
        return;
      }

      const spawnGameObjectComponentPool = Essence.getOrAddPool(essence, SpawnGameObjectEventComponentName);
      const imageComponentPool = Essence.getOrAddPool(essence, ImageComponentName);
      const positionComponentPool = Essence.getOrAddPool(essence, PositionComponentName);
      const sizeComponentPool = Essence.getOrAddPool(essence, SizeComponentName);
      const draggableComponentPool = Essence.getOrAddPool(essence, DraggableComponentName);
      const selectableComponentPool = Essence.getOrAddPool(essence, SelectableComponentName);
      const lockableComponentPool = Essence.getOrAddPool(essence, LockableComponentName);
      const deletableComponentPool = Essence.getOrAddPool(essence, DeletableComponentName);
      const dynamicDepthComponentPool = Essence.getOrAddPool(essence, DynamicDepthComponentName);
      const gameObjectComponentPool = Essence.getOrAddPool(essence, GameObjectComponentName);

      for (const gameObjectEntity of entities) {
        const spawnComponent = Pool.get(spawnGameObjectComponentPool, gameObjectEntity);

        Pool.add(gameObjectComponentPool, gameObjectEntity, {
          id: ComponentId.new(),
          name: GameObjectComponentName,
          data: {},
        });

        // . Create react game map
        Pool.add(imageComponentPool, gameObjectEntity, {
          id: ComponentId.new(),
          name: ImageComponentName,
          data: {
            url: spawnComponent.data.imageUrl,
          },
        });

        Pool.add(positionComponentPool, gameObjectEntity, {
          id: ComponentId.new(),
          name: PositionComponentName,
          data: {
            x: spawnComponent.data.x,
            y: spawnComponent.data.y,
            z: lastZ + 1,
          },
        });

        Pool.add(sizeComponentPool, gameObjectEntity, {
          id: ComponentId.new(),
          name: SizeComponentName,
          data: {
            width: spawnComponent.data.width,
            height: spawnComponent.data.height,
          },
        });

        if (spawnComponent.data.dynamicDepth) {
          Pool.add(dynamicDepthComponentPool, gameObjectEntity, {
            id: ComponentId.new(),
            name: DynamicDepthComponentName,
            data: {},
          });
        }

        if (spawnComponent.data.selectable) {
          Pool.add(selectableComponentPool, gameObjectEntity, {
            id: ComponentId.new(),
            name: SelectableComponentName,
            data: {},
          });
        }

        if (spawnComponent.data.draggable) {
          Pool.add(draggableComponentPool, gameObjectEntity, {
            id: ComponentId.new(),
            name: DraggableComponentName,
            data: {},
          });
        }

        if (spawnComponent.data.lockable) {
          Pool.add(lockableComponentPool, gameObjectEntity, {
            id: ComponentId.new(),
            name: LockableComponentName,
            data: {},
          });
        }

        if (spawnComponent.data.deletable) {
          Pool.add(deletableComponentPool, gameObjectEntity, {
            id: ComponentId.new(),
            name: DeletableComponentName,
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

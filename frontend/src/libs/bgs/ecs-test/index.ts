import { Component, ComponentId, ComponentsPool } from '../../ecs/component';
import { System } from '../../ecs/system';
import { World } from '../../ecs/world';
import { EntityId } from '../../ecs/entity';
import { Ignitor } from '../../ecs/ignitor';

export type PositionComponent = Component<
  'PositionComponent',
  {
    x: number;
    y: number;
    z: number;
  }
>;

export type DraggableComponent = Component<
  'DraggableComponent',
  {
    isDragging: boolean;
    draggable: boolean;
    locked: boolean;
  }
>;

export type ImageComponent = Component<
  'ImageComponent',
  {
    url: string;
  }
>;

export type SpawnGameMapComponent = Component<
  'SpawnGameMapComponent',
  {
    url: string;
    name: string;
  }
>;

export type CreateReactMapComponent = Component<
  'CreateReactMapComponent',
  {
    x: number;
    y: number;
    url: string;
    name: string;
  }
>;

export const SpawnGameMapSystem = (): System<{
  SpawnGameMapComponent: SpawnGameMapComponent;
  CreateReactMapComponent: CreateReactMapComponent;
}> => ({
  run: async (world) => {
    console.log('SpawnGameMapSystem', world);

    const pool = World.getPool<SpawnGameMapComponent>(world, 'SpawnGameMapComponent');
    if (!pool) {
      return world;
    }

    let [createReactMapComponentPool, newWorld] = World.getOrAddPool<CreateReactMapComponent>(
      world,
      'CreateReactMapComponent'
    );

    let [imageComponentPool, newImCWorld] = World.getOrAddPool<ImageComponent>(newWorld, 'ImageComponent');

    let [positionComponentPool, newImWorld3] = World.getOrAddPool<PositionComponent>(newImCWorld, 'PositionComponent');

    console.log(createReactMapComponentPool);
    for (const poolElement of pool.components) {
      const component: CreateReactMapComponent = {
        name: 'CreateReactMapComponent',
        id: ComponentId.new(),
        data: {
          x: 0,
          y: 0,
          url: poolElement.data.url,
          name: poolElement.data.name,
        },
      };
      const entity = EntityId.new();
      newImWorld3 = World.addPool(
        World.addPool(
          World.addPool(world, ComponentsPool.addComponent(createReactMapComponentPool, entity, component)),
          ComponentsPool.addComponent(imageComponentPool, entity, {
            name: 'ImageComponent',
            id: ComponentId.new(),
            data: {
              url: poolElement.data.url,
            },
          })
        ),
        ComponentsPool.addComponent(positionComponentPool, entity, {
          name: 'PositionComponent',
          id: ComponentId.new(),
          data: {
            x: 100,
            y: 100,
            z: 100,
          },
        })
      );
    }

    return newImWorld3;
  },
});

export type BgsWorld = World<{
  CreateReactMapComponent: CreateReactMapComponent;
  SpawnGameMapComponent: SpawnGameMapComponent;
  ImageComponent: ImageComponent;
  PositionComponent: PositionComponent;
}>;

export type BgsIgnitor = Ignitor<BgsWorld>;

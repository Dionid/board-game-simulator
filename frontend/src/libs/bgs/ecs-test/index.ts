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
      newWorld = World.addPool(
        world,
        ComponentsPool.addComponent(createReactMapComponentPool, EntityId.new(), component)
      );
    }

    return newWorld;
  },
});

export type BgsWorld = World<{
  CreateReactMapComponent: CreateReactMapComponent;
  SpawnGameMapComponent: SpawnGameMapComponent;
}>;

export type BgsIgnitor = Ignitor<BgsWorld>;

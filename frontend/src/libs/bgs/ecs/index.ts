import { Component, ComponentId, Pool } from '../../ecs/component';
import { System } from '../../ecs/system';
import { World } from '../../ecs/world';
import { EntityId } from '../../ecs/entity';
import { Ignitor } from '../../ecs/ignitor';
import { ReactComponent } from '../../ecs/react';

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

// REACT

export type ReactPositionComponentData = { x: number; y: number };
export type ReactPositionComponent = ReactComponent<'ReactPositionComponent', ReactPositionComponentData>;

export const ChangeReactPositionSystem = (): System<{
  ReactPositionComponent: ReactPositionComponent;
  PositionComponent: PositionComponent;
}> => ({
  run: async (world) => {
    const entities = World.filter(world, ['ReactPositionComponent', 'PositionComponent']);
    if (entities.length === 0) {
      return;
    }

    const positionPool = World.getOrAddPool(world, 'PositionComponent');
    const reactPositionPool = World.getOrAddPool(world, 'ReactPositionComponent');

    entities.forEach((entity) => {
      const positionComponent = Pool.get(positionPool, entity);
      const reactPositionComponent = Pool.get(reactPositionPool, entity);
      reactPositionComponent.data.setState({ x: positionComponent.data.x, y: positionComponent.data.y });
    });
  },
});

export type ReactImageComponentData = { url: string };
export type ReactImageComponent = ReactComponent<'ReactImageComponent', ReactImageComponentData>;

export const ChangeReactImageSystem = (): System<{
  ReactImageComponent: ReactImageComponent;
  ImageComponent: ImageComponent;
}> => ({
  run: async (world) => {
    const entities = World.filter(world, ['ReactImageComponent', 'ImageComponent']);
    if (entities.length === 0) {
      return;
    }

    const imagePool = World.getOrAddPool(world, 'ImageComponent');
    const reactImagePool = World.getOrAddPool(world, 'ReactImageComponent');

    entities.forEach((entity) => {
      const imageComponent = Pool.get(imagePool, entity);
      const reactImageComponent = Pool.get(reactImagePool, entity);
      reactImageComponent.data.setState({ url: imageComponent.data.url });
    });
  },
});

export type SpawnGameMapComponent = Component<
  'SpawnGameMapComponent',
  {
    url: string;
  }
>;

export type ReactGameMapComponent = Component<'ReactGameMapComponent', {}>;

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

export type BgsWorld = World<{
  ReactGameMapComponent: ReactGameMapComponent;
  SpawnGameMapComponent: SpawnGameMapComponent;
  ImageComponent: ImageComponent;
  PositionComponent: PositionComponent;
  ReactPositionComponent: ReactPositionComponent;
  ReactImageComponent: ReactImageComponent;
}>;

export type BgsIgnitor = Ignitor<BgsWorld>;

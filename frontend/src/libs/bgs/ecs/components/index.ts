import { Component } from '../../../ecs/component';
import { ReactComponent } from '../../../ecs/react';
import { UUID } from '../../../branded-types';
import { SetId } from '../../games/unmatched';

// INTERACTIONS

export type HandComponent = Component<
  'HandComponent',
  {
    current: {
      x: number;
      y: number;
      down: boolean;
    };
    previous: {
      x: number;
      y: number;
      down: boolean;
    };
  }
>;

// ACCESS

export type PlayerComponent = Component<
  'PlayerComponent',
  {
    id: UUID;
  }
>;

export type OwnerComponent = Component<'OwnerComponent', {}>;

// OBJECTS

export type PositionComponent = Component<
  'PositionComponent',
  {
    x: number;
    y: number;
    z: number;
  }
>;

export type DraggableComponent = Component<'DraggableComponent', {}>;

export type IsDraggingComponent = Component<'IsDraggingComponent', {}>;

export type SelectableComponent = Component<'SelectableComponent', {}>;

export type IsSelectedComponent = Component<'IsSelectedComponent', {}>;

export type ImageComponent = Component<
  'ImageComponent',
  {
    url: string;
  }
>;

export type SizeComponent = Component<
  'SizeComponent',
  {
    width: number;
    height: number;
  }
>;

export type SpawnGameMapComponent = Component<
  'SpawnGameMapComponent',
  {
    url: string;
  }
>;

export type SpawnHeroComponent = Component<
  'SpawnHeroComponent',
  {
    url: string;
  }
>;

export type SpawnHeroSetComponent = Component<
  'SpawnHeroSetComponent',
  {
    setId: SetId;
  }
>;

export type GameObjectComponent = Component<'GameObjectComponent', {}>;

export type SpawnGameObjectEventComponent = Component<
  'SpawnGameObjectEventComponent',
  {
    x: number;
    y: number;
    width: number;
    height: number;
    draggable: boolean;
    selectable: boolean;
    imageUrl: string;
  }
>;

export type ReactPositionComponentData = { x: number; y: number };
export type ReactPositionComponent = ReactComponent<'ReactPositionComponent', ReactPositionComponentData>;

export type ReactSizeComponentData = { width: number; height: number };
export type ReactSizeComponent = ReactComponent<'ReactSizeComponent', ReactSizeComponentData>;

export type ReactImageComponentData = { url: string };
export type ReactImageComponent = ReactComponent<'ReactImageComponent', ReactImageComponentData>;

export type ReactGameMapComponent = Component<'ReactGameMapComponent', {}>;
export type ReactHeroComponent = Component<'ReactHeroComponent', {}>;

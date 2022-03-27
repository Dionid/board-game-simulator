import { Component } from '../../../ecs/component';
import { ReactComponent } from '../../../ecs/react';

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

export type SizeComponent = Component<
  'SizeComponent',
  {
    width: number;
    height: number;
  }
>;

export type ReactPositionComponentData = { x: number; y: number };
export type ReactPositionComponent = ReactComponent<'ReactPositionComponent', ReactPositionComponentData>;

export type ReactSizeComponentData = { width: number; height: number };
export type ReactSizeComponent = ReactComponent<'ReactSizeComponent', ReactSizeComponentData>;

export type ReactImageComponentData = { url: string };
export type ReactImageComponent = ReactComponent<'ReactImageComponent', ReactImageComponentData>;

export type SpawnGameMapComponent = Component<
  'SpawnGameMapComponent',
  {
    url: string;
  }
>;
export type ReactGameMapComponent = Component<'ReactGameMapComponent', {}>;

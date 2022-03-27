import { Component, ComponentId } from '../esc';

export type PositionComponent = Component<
  'PositionComponent',
  {
    x: number;
    y: number;
    z: number;
  }
>;

export const PositionComponent = {
  new: (id: ComponentId, x: number, y: number, z: number): PositionComponent => {
    return {
      name: 'PositionComponent',
      id,
      data: {
        x,
        y,
        z,
      },
    };
  },
};

export type DraggableComponent = Component<
  'DraggableComponent',
  {
    isDragging: boolean;
    draggable: boolean;
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

export type OwnerComponent = Component<
  'OwnerComponent',
  {
    playerId: string;
  }
>;

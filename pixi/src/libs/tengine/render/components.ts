import { literal, newSchema, number, string, union } from 'libs/tecs';
import { Size2, Vector2 } from '../core';

// export const View = newTag();

export const Rectangle = newSchema({
  type: literal('rectangle'),
  size: Size2,
});

export const Circle = newSchema({
  type: literal('circle'),
  radius: number,
});

export const Polygon = newSchema({
  type: literal('polygon'),
  // ...
});

export const Graphics = newSchema({
  type: literal('graphics'),
  shape: union(Rectangle, Circle, Polygon),
  color: string,
});

export const Sprite = newSchema({
  type: literal('sprite'),
  texture: string,
});

export const View = newSchema({
  offset: Vector2,
  scale: Vector2,
  model: union(Graphics, Sprite),
});

// # pixi specific

// ## pixi.Graphics component

// export const $graphics = Symbol('graphics');

// export const graphics = {
//   [$kind]: $graphics,
//   byteLength: 8,
//   [$defaultFn]: () => new pGraphics(),
// } as const;

// export const Graphics = newSchema({
//   value: graphics,
// });

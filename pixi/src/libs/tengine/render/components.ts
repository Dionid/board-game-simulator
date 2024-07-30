import { literal, newSchema, number, string, union } from 'libs/tecs';
import { Size2, Vector2 } from '../core';

export const Rectangle = newSchema({
  type: literal('rectangle'),
  size: Size2,
  anchor: Vector2,
});

export const Circle = newSchema({
  type: literal('circle'),
  radius: number,
  anchor: Vector2,
});

export const Line = newSchema({
  type: literal('line'),
  length: number,
  anchor: number,
});

export const Capsule = newSchema({
  type: literal('capsule'),
  length: number,
  radius: number,
  anchor: Vector2,
});

export const Polygon = newSchema({
  type: literal('polygon'),
  anchor: Vector2,
  // ...
});

export const Graphics = newSchema({
  type: literal('graphics'),
  shape: union(Rectangle, Circle, Polygon, Line, Capsule),
  color: string,
});

export const Sprite = newSchema({
  type: literal('sprite'),
  texture: string,
});

export const View = newSchema({
  offset: Vector2,
  scale: Vector2,
  rotation: number,
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

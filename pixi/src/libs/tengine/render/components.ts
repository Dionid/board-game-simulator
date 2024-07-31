import { Container, Graphics as pG } from 'pixi.js';
import { $defaultFn, $kind, literal, newSchema, number, string, union } from 'libs/tecs';
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

// export const Line = newSchema({
//   type: literal('line'),
//   length: number,
//   anchor: number,
// });

// export const Capsule = newSchema({
//   type: literal('capsule'),
//   length: number,
//   radius: number,
//   anchor: Vector2,
// });

// export const Polygon = newSchema({
//   type: literal('polygon'),
//   anchor: Vector2,
//   // ...
// });

export const Graphics = newSchema({
  type: literal('graphics'),
  shape: union(Rectangle, Circle),
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

export const $graphics = Symbol('graphics');

export const graphics = {
  [$kind]: $graphics,
  byteLength: 8,
  [$defaultFn]: () => new pG(),
} as const;

export const $container = Symbol('container');

export const container = {
  [$kind]: $container,
  byteLength: 8,
  [$defaultFn]: () => new Container(),
} as const;

export const pView = newSchema({
  graphics: graphics,
  container: container,
});

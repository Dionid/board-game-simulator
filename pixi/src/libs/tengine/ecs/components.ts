import { Graphics } from 'pixi.js';
import { newTag, $kind, $defaultFn, newSchema, number, string, arrayOf } from '../../tecs';

export const View = newTag();

export const pGraphicsTag = newTag();

// # pGraphics
export const $graphics = Symbol('graphics');

export const graphics = {
  [$kind]: $graphics,
  byteLength: 8,
  [$defaultFn]: () => new Graphics(),
} as const;

export const pGraphics = newSchema({
  value: graphics,
});

export const Shape = newSchema({
  name: string,
  // TODO: add size by type
});

export const Pivot = newSchema({
  x: number,
  y: number,
});

export const Position = newSchema({
  x: number,
  y: number,
});

export const Rotation = newSchema({
  value: number,
});

export const Velocity = newSchema({
  x: number,
  y: number,
});

export const Acceleration = newSchema({
  x: number,
  y: number,
});

export const Speed = newSchema({
  value: number,
});

export const Size = newSchema({
  width: number,
  height: number,
});

export const Color = newSchema({
  value: string,
});

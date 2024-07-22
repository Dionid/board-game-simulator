import { Graphics } from 'pixi.js';
import { newTag, $kind, $defaultFn, newSchema, number, string } from '../../tecs';

export const View = newTag();

export const pGraphicsTag = newTag();

export const $graphics = Symbol('graphics');

export const graphics = {
  [$kind]: $graphics,
  byteLength: 8,
  [$defaultFn]: () => new Graphics(),
} as const;

export const pGraphics = newSchema({
  value: graphics,
});

export const pGraphicsType = newSchema({
  type: string,
});

export const Position = newSchema({
  x: number,
  y: number,
});

export const Velocity = newSchema({
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

export const Radius = newSchema({
  value: number,
});

export const Color = newSchema({
  value: string,
});

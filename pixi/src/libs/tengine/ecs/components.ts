import { Graphics } from 'pixi.js';
import { newTag, $kind, $defaultFn, newSchema, number, string } from '../../tecs';
import { Body } from 'matter-js';

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

// # mBody
export const $mBody = Symbol('mBody');

export const body = {
  [$kind]: $mBody,
  byteLength: 8,
  [$defaultFn]: () => Body.create({}),
} as const;

export const mBody = newSchema({
  value: body,
});

export const Shape = newSchema({
  name: string,
});

export const Pivot = newSchema({
  x: number,
  y: number,
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

export const Color = newSchema({
  value: string,
});

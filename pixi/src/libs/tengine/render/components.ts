import { newSchema, newTag, number, string } from 'libs/tecs';
import { Position2, Size2 } from '../physics/components';

export const View = newTag();

export const Rectangle = newSchema({
  offset: Position2, // relative to the entity position
  size: Size2,
});

export const Circle = newSchema({
  offset: Position2, // relative to the entity position
  radius: number,
});

export const Polygon = newSchema({
  // ...
});

export const Color = newSchema({
  value: string,
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

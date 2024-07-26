import { newTag, newSchema, number, string, boolean, Tag } from '../../tecs';

export const View = newTag();

export const Pivot2 = newSchema({
  x: number,
  y: number,
});

export const Position2 = newSchema({
  x: number,
  y: number,
});

export const LockTranslation2 = newSchema({
  x: boolean,
  y: boolean,
});

export const Rotation = newSchema({
  value: number,
});

export const LockRotation2 = newSchema({
  x: boolean,
  y: boolean,
});

export const Velocity2 = newSchema({
  x: number,
  y: number,
});

export const Acceleration2 = newSchema({
  x: number,
  y: number,
});

export const Speed = newSchema({
  value: number,
});

export const Size2 = newSchema({
  width: number,
  height: number,
});

export const Color = newSchema({
  value: string,
});

// # Shapes

// export const Shape = Tag.new();

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

// # pixi specific

export const GraphicsTag = newTag();

// export const $graphics = Symbol('graphics');

// export const graphics = {
//   [$kind]: $graphics,
//   byteLength: 8,
//   [$defaultFn]: () => new pGraphics(),
// } as const;

// export const Graphics = newSchema({
//   value: graphics,
// });

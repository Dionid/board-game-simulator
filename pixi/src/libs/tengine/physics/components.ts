import { boolean, newSchema, number, Tag } from '../../tecs';

export const Static = Tag.new();
export const Kinematic = Tag.new();
export const Dynamic = Tag.new();

// export const RigidBody2 = newSchema({
//   type: union(literal('static'), literal('kinematic'), literal('dynamic')),
// });

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

export const Position2 = newSchema({
  x: number,
  y: number,
});

export const Pivot2 = newSchema({
  x: number,
  y: number,
});

export const LockTranslation2 = newSchema({
  x: boolean,
  y: boolean,
});

// export const Rotation = newSchema({
//   value: number,
// });

// export const LockRotation2 = newSchema({
//   x: boolean,
//   y: boolean,
// });

import { newSchema, number, Tag } from '../../tecs';

export const Static = Tag.new();
export const Kinematic = Tag.new();
export const Dynamic = Tag.new();

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

import { newSchema, number, string, boolean } from 'libs/tecs';

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

export const Size2 = newSchema({
  width: number,
  height: number,
});

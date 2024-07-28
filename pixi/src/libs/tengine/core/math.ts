import { newSchema, number } from 'libs/tecs';

export type Vector2 = {
  x: number;
  y: number;
};

export const Vector2 = newSchema({
  x: number,
  y: number,
});

export function mulV2(v1: Vector2, v2: Vector2): Vector2 {
  return {
    x: v1.x * v2.x,
    y: v1.y * v2.y,
  };
}

export function mutMulV2(v1: Vector2, v2: Vector2) {
  v1.x *= v2.x;
  v1.y *= v2.y;
}

export function mulScalarV2(v: Vector2, scalar: number): Vector2 {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
  };
}

export function mutMulScalarV2(v: Vector2, scalar: number) {
  v.x *= scalar;
  v.y *= scalar;
}

export function addV2(v1: Vector2, v2: Vector2): Vector2 {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y,
  };
}

export function mutAddV2(v1: Vector2, v2: Vector2): void {
  v1.x += v2.x;
  v1.y += v2.y;
}

export function subV2(v1: Vector2, v2: Vector2): Vector2 {
  return {
    x: v1.x - v2.x,
    y: v1.y - v2.y,
  };
}

export function mutSubV2(v1: Vector2, v2: Vector2): void {
  v1.x -= v2.x;
  v1.y -= v2.y;
}

export function magV2(v: Vector2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function dotV2(v1: Vector2, v2: Vector2): number {
  return v1.x * v2.x + v1.y * v2.y;
}

export function unitV2(v: Vector2): Vector2 {
  const mag = magV2(v);
  if (mag === 0) {
    return { x: 0, y: 0 };
  }
  return {
    x: v.x / mag,
    y: v.y / mag,
  };
}

export function mutUnitV2(v: Vector2) {
  const mag = magV2(v);
  if (mag === 0) {
    v.x = 0;
    v.y = 0;
    return;
  }
  v.x = v.x / mag;
  v.y = v.y / mag;
}

export const normalizeV2 = unitV2;
export const mutNormalizeV2 = mutUnitV2;

export type Velocity2 = Vector2;

export const Velocity2 = newSchema({
  x: number,
  y: number,
});

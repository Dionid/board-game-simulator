import { newSchema, newTag, number } from 'libs/tecs';

export function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export type Vector2 = {
  x: number;
  y: number;
};

export const Vector2 = newSchema({
  x: number,
  y: number,
});

export function multV2(v: Vector2, scalar: number): Vector2 {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
  };
}

export function mutMultV2(v: Vector2, scalar: number) {
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

export function crossV2(v1: Vector2, v2: Vector2): number {
  return v1.x * v2.y - v1.y * v2.x;
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

export const normalV2 = (v: Vector2): Vector2 => {
  return {
    x: -v.y,
    y: v.x,
  };
};

export const mutNormalV2 = (v: Vector2): void => {
  const x = v.x;
  v.x = -v.y;
  v.y = x;
};

export const unitNormalV2 = (v: Vector2): Vector2 => {
  return unitV2(normalV2(v));
};

export const mutUnitNormalV2 = (v: Vector2): void => {
  mutUnitV2(normalV2(v));
};

export function translateV2(vertex: Vector2, x: number, y: number): Vector2 {
  return {
    x: vertex.x + x,
    y: vertex.y + y,
  };
}

export function mutTranslateV2(vertex: Vector2, x: number, y: number): void {
  vertex.x += x;
  vertex.y += y;
}

export function rotateV2(vertex: Vector2, angle: number): Vector2 {
  return {
    x: vertex.x * Math.cos(angle) - vertex.y * Math.sin(angle),
    y: vertex.x * Math.sin(angle) + vertex.y * Math.cos(angle),
  };
}

export function mutRotateV2(vertex: Vector2, angle: number): void {
  const x = vertex.x;
  vertex.x = x * Math.cos(angle) - vertex.y * Math.sin(angle);
  vertex.y = x * Math.sin(angle) + vertex.y * Math.cos(angle);
}

export function rotateV2Around(vertex: Vector2, angle: number, center: Vector2): Vector2 {
  const x = vertex.x - center.x;
  const y = vertex.y - center.y;
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle) + center.x,
    y: x * Math.sin(angle) + y * Math.cos(angle) + center.y,
  };
}

export function mutRotateV2Around(vertex: Vector2, angle: number, center: Vector2): void {
  const x = vertex.x - center.x;
  const y = vertex.y - center.y;
  vertex.x = x * Math.cos(angle) - y * Math.sin(angle) + center.x;
  vertex.y = x * Math.sin(angle) + y * Math.cos(angle) + center.y;
}

export const horizontalVector = {
  x: 1,
  y: 0,
};

export type Matrix = {
  row: number;
  col: number;
  data: number[][];
};

export const multiplyMatrixV2 = (m: Matrix, v: Vector2): Vector2 => {
  return {
    x: m.data[0][0] * v.x + m.data[0][1] * v.y,
    y: m.data[1][0] * v.x + m.data[1][1] * v.y,
  };
};

export const rotationMatrix = (angle: number): Matrix => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    row: 2,
    col: 2,
    data: [
      [cos, -sin],
      [sin, cos],
    ],
  };
};

export type Velocity2 = Vector2;

export const Velocity2 = newSchema({
  x: number,
  y: number,
  max: number,
});

export type Friction = number;

export const Friction = newSchema({
  value: number,
});

export const DisableFriction = newTag();

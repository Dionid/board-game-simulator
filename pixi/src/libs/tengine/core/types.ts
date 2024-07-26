import { newSchema, number } from 'libs/tecs';
import { Container } from 'pixi.js';

export type MinMax = {
  min: number;
  max: number;
};

export type Vector2 = {
  x: number;
  y: number;
};

export const Vector2 = newSchema({
  x: number,
  y: number,
});

export function mulV2(v: Vector2, scalar: number): Vector2 {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
  };
}

export function mutMulV2(v: Vector2, scalar: number) {
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
  return {
    x: v.x / mag,
    y: v.y / mag,
  };
}

export type Velocity2 = Vector2;

export const Velocity2 = newSchema({
  x: number,
  y: number,
});

export type Position2 = Vector2;

export const Position2 = newSchema({
  x: number,
  y: number,
});

export type Size2 = {
  width: number;
  height: number;
};

export const Size2 = newSchema({
  width: number,
  height: number,
});

export type TablePosition = {
  row: number;
  col: number;
};

export type Map = {
  container: Container;
};

export type Acceleration2 = Vector2;

export const Acceleration2 = newSchema({
  x: number,
  y: number,
});

export type Speed = {
  value: number;
};

export const Speed = newSchema({
  value: number,
});

export type Scale = Vector2;

export const Scale = newSchema({
  x: number,
  y: number,
});

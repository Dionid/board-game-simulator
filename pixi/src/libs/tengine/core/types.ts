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

export const multiplyVector2 = (v: Vector2, scalar: number): Vector2 => {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
  };
};

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

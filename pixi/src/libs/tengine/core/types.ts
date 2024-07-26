import { Container } from 'pixi.js';

export type MinMax = {
  min: number;
  max: number;
};

export type Vector2 = {
  x: number;
  y: number;
};

export const multiplyVector2 = (v: Vector2, scalar: number): Vector2 => {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
  };
};

export type Velocity2 = Vector2;

export type Position2 = Vector2;

export type Size2 = {
  width: number;
  height: number;
};

export type TablePosition = {
  row: number;
  col: number;
};

export type Map = {
  container: Container;
};

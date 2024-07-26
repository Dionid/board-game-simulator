import { Container } from 'pixi.js';

export type MinMax = {
  min: number;
  max: number;
};

export type Vector2 = {
  x: number;
  y: number;
};

export type Acceleration2 = Vector2;

export type Velocity2 = Vector2;

export type Position2 = Vector2;

export type Axis2 = Vector2;

export type Size2 = {
  width: number;
  height: number;
};

export type TablePosition = {
  row: number;
  col: number;
};

export type Rectangle2 = {
  position: Position2;
  size: Size2;
};

export type Circle2 = {
  position: Position2;
  radius: number;
};

export type Map = {
  container: Container;
};

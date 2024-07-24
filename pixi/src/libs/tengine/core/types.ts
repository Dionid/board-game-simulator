import { Container } from 'pixi.js';

export type MinMax = {
  min: number;
  max: number;
};

export type Vector2 = {
  x: number;
  y: number;
};

export type Acceleration = Vector2;

export type Velocity = Vector2;

export type Position = Vector2;

export type Size = {
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

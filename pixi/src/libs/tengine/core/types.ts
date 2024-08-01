import { newSchema, number } from 'libs/tecs';
import { Container } from 'pixi.js';
import { Vector2 } from './math';

export type MinMax = {
  min: number;
  max: number;
};

export type Position2 = Vector2;

export const Position2 = newSchema({
  x: number,
  y: number,
  _prev: Vector2,
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

export type Angle = number;

export const Angle = newSchema({
  value: number,
  _prev: number,
});

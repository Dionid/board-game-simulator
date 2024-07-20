import { Container } from 'pixi.js';

export type Vector2 = {
  x: number;
  y: number;
};

export type Camera = {
  x: number;
  y: number;
  width: number;
  height: number;
  boundLX: number;
  boundLY: number;
  boundRX: number;
  boundRY: number;
};

export type WorldScene = {
  container: Container;
  size: Vector2;
  cameras: {
    main: Camera;
  };
  boundLX: number;
  boundTY: number;
};

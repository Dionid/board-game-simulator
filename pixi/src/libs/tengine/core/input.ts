import { Vector2 } from './math';

export type KeyBoardInput = {
  keyDown: Record<string, boolean>;
  keyUp: string[];
};

export type MouseInput = {
  clientPosition: Vector2;
  scenePosition: Vector2;
  mapPosition: Vector2;
  up: boolean;
  down: boolean;
  previous: Omit<MouseInput, 'previous'>;
  delta: {
    clientPosition: Vector2;
    scenePosition: Vector2;
  };
};

export const newMouseInput = (): MouseInput => {
  return {
    clientPosition: {
      x: 0,
      y: 0,
    },
    scenePosition: {
      x: 0,
      y: 0,
    },
    mapPosition: {
      x: 0,
      y: 0,
    },
    up: false,
    down: false,
    delta: {
      clientPosition: {
        x: 0,
        y: 0,
      },
      scenePosition: {
        x: 0,
        y: 0,
      },
    },
    previous: {
      clientPosition: {
        x: 0,
        y: 0,
      },
      scenePosition: {
        x: 0,
        y: 0,
      },
      mapPosition: {
        x: 0,
        y: 0,
      },
      up: false,
      down: false,
      delta: {
        clientPosition: {
          x: 0,
          y: 0,
        },
        scenePosition: {
          x: 0,
          y: 0,
        },
      },
    },
  };
};

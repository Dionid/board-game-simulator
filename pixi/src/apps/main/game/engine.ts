import { Container } from 'pixi.js';

export type Vector2 = {
  x: number;
  y: number;
};

export type Camera = {
  position: Vector2;
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

export const createWorldScene = (config?: {
  camera?: {
    position?: Vector2;
    width?: number;
    height?: number;
    boundLX?: number;
    boundLY?: number;
    boundRX?: number;
    boundRY?: number;
  };
  worldScene?: {
    size?: Vector2;
    boundLX?: number;
    boundTY?: number;
  };
}): WorldScene => {
  const sceneSizeX = config?.worldScene?.size?.x ?? 2000;
  const sceneSizeY = config?.worldScene?.size?.y ?? 1000;
  const sceneBoundLX = config?.worldScene?.boundLX ?? 0;
  const sceneBoundTY = config?.worldScene?.boundLX ?? 0;

  // ## Container
  const sceneContainer = new Container({
    isRenderGroup: true,
  });

  // # Camera
  const camera: Camera = {
    position: {
      x: config?.camera?.position?.x ?? 0,
      y: config?.camera?.position?.y ?? 0,
    },
    width: config?.camera?.width ?? 0,
    height: config?.camera?.height ?? 0,
    boundLX: config?.camera?.boundLX ?? 0,
    boundLY: config?.camera?.boundLY ?? 0,
    boundRX: config?.camera?.boundRX ?? 0,
    boundRY: config?.camera?.boundRY ?? 0,
  };

  const worldScene: WorldScene = {
    container: sceneContainer,
    size: {
      x: sceneSizeX,
      y: sceneSizeY,
    },
    cameras: {
      main: camera,
    },
    boundLX: sceneBoundLX,
    boundTY: sceneBoundTY,
  };

  return worldScene;
};

import { Application, Container } from 'pixi.js';

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
  app: Application;
  container: Container;
  size: Vector2;
  cameras: {
    main: Camera;
  };
  boundLX: number;
  boundTY: number;
};

export const createWorldScene = (
  app: Application,
  config?: {
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
  }
): WorldScene => {
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

  // ## On resize change camera last coordinates
  app.canvas.addEventListener('resize', () => {
    camera.width = app.renderer.width;
    camera.height = app.renderer.width;
    camera.boundRX = worldScene.size.x - camera.width;
    camera.boundRY = worldScene.size.y - camera.height;

    if (camera.position.x > camera.boundRX) {
      camera.position.x = camera.boundRX;
    }
    if (camera.position.y > camera.boundRY) {
      camera.position.y = camera.boundRY;
    }
  });

  const worldScene: WorldScene = {
    app,
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

export const moveCameraByDragging = (worldScene: WorldScene) => {
  const camera = worldScene.cameras.main;

  let mouseDown = false;

  worldScene.app.canvas.addEventListener('mousedown', (e) => {
    mouseDown = true;
  });

  worldScene.app.canvas.addEventListener('mouseup', (e) => {
    mouseDown = false;
  });

  worldScene.app.canvas.addEventListener('mousemove', (e) => {
    // # Calculate new camera
    if (mouseDown) {
      const newCameraX = camera.position.x - e.movementX;
      const newCameraY = camera.position.y - e.movementY;

      if (camera.position.x < camera.boundLX) {
        camera.position.x = camera.boundLX;
      } else if (camera.position.x > camera.boundRX) {
        camera.position.x = camera.boundRX;
      } else {
        camera.position.x = newCameraX;
      }

      if (camera.position.y < camera.boundLY) {
        camera.position.y = camera.boundLY;
      } else if (camera.position.y > camera.boundRY) {
        camera.position.y = camera.boundRY;
      } else {
        camera.position.y = newCameraY;
      }
    }
  });
};

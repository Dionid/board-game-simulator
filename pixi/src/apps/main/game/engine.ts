import { Application, Container } from 'pixi.js';

export type Vector2 = {
  x: number;
  y: number;
};

export type Camera = {
  position: Vector2;
  scaledPosition: Vector2;
  width: number;
  height: number;
  scale: number;
  boundLX: number;
  boundLY: number;
  boundRX: number;
  boundRY: number;
};

export function setCameraPosition(camera: Camera, x: number, y: number) {
  camera.position.x = x;
  camera.position.y = y;

  camera.scaledPosition.x = camera.position.x / camera.scale;
  camera.scaledPosition.y = camera.position.y / camera.scale;
}

export type MouseInput = {
  clientPosition: Vector2;
  scenePosition: Vector2;
  up: boolean;
  down: boolean;
  previous: Omit<MouseInput, 'previous'>;
};

export type WorldScene = {
  app: Application;
  container: Container;
  input: {
    mouse: MouseInput;
  };
  size: {
    width: number;
    height: number;
  };
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
      scale?: number;
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
    scaledPosition: {
      x: 0,
      y: 0,
    },
    scale: config?.camera?.scale ?? 1,
    width: config?.camera?.width ?? 0,
    height: config?.camera?.height ?? 0,
    boundLX: config?.camera?.boundLX ?? 0,
    boundLY: config?.camera?.boundLY ?? 0,
    boundRX: config?.camera?.boundRX ?? 0,
    boundRY: config?.camera?.boundRY ?? 0,
  };

  camera.scaledPosition.x = camera.position.x / camera.scale;
  camera.scaledPosition.y = camera.position.y / camera.scale;

  // ## On resize change camera last coordinates
  app.canvas.addEventListener('resize', () => {
    camera.width = app.renderer.width;
    camera.height = app.renderer.width;
    camera.boundRX = worldScene.size.width - camera.width;
    camera.boundRY = worldScene.size.height - camera.height;

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
    input: {
      mouse: {
        clientPosition: {
          x: 0,
          y: 0,
        },
        scenePosition: {
          x: 0,
          y: 0,
        },
        up: false,
        down: false,
        previous: {
          clientPosition: {
            x: 0,
            y: 0,
          },
          scenePosition: {
            x: 0,
            y: 0,
          },
          up: false,
          down: false,
        },
      },
    },
    size: {
      width: sceneSizeX,
      height: sceneSizeY,
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
  worldScene.app.canvas.addEventListener('mousedown', (e) => {
    worldScene.input.mouse.previous.down = worldScene.input.mouse.down;
    worldScene.input.mouse.previous.up = worldScene.input.mouse.up;

    worldScene.input.mouse.down = true;
    worldScene.input.mouse.up = false;
  });

  worldScene.app.canvas.addEventListener('mouseup', (e) => {
    worldScene.input.mouse.previous.down = worldScene.input.mouse.down;
    worldScene.input.mouse.previous.up = worldScene.input.mouse.up;

    worldScene.input.mouse.down = false;
    worldScene.input.mouse.up = true;
  });

  // const camera = worldScene.cameras.main;
  //
  // worldScene.app.canvas.addEventListener('mousemove', (e) => {
  //   // # Calculate new camera
  //   if (worldScene.input.mouse.down) {
  //     const newCameraX = camera.position.x - e.movementX;
  //     const newCameraY = camera.position.y - e.movementY;

  //     if (camera.position.x < camera.boundLX) {
  //       camera.position.x = camera.boundLX;
  //     } else if (camera.position.x > camera.boundRX) {
  //       camera.position.x = camera.boundRX;
  //     } else {
  //       camera.position.x = newCameraX;
  //     }

  //     if (camera.position.y < camera.boundLY) {
  //       camera.position.y = camera.boundLY;
  //     } else if (camera.position.y > camera.boundRY) {
  //       camera.position.y = camera.boundRY;
  //     } else {
  //       camera.position.y = newCameraY;
  //     }

  //     camera.scaledPosition.x = camera.position.x / camera.scale;
  //     camera.scaledPosition.y = camera.position.y / camera.scale;
  //   }
  // });
};

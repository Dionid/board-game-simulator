import { Application, Container } from 'pixi.js';

export type Vector2 = {
  x: number;
  y: number;
};

export type Velocity = Vector2;

export type Size = {
  width: number;
  height: number;
};

export type Camera = {
  position: Vector2;
  width: number;
  height: number;
  scale: number;
  target: {
    scale: number;
  };
  scaled: {
    position: Vector2;
    size: Size;
  };
};

export function setCameraPosition(camera: Camera, x: number, y: number) {
  camera.position.x = x;
  camera.position.y = y;

  camera.scaled.position.x = x / camera.scale;
  camera.scaled.position.y = y / camera.scale;
}

export type MouseInput = {
  clientPosition: Vector2;
  scenePosition: Vector2;
  up: boolean;
  down: boolean;
  previous: Omit<MouseInput, 'previous'>;
  delta: {
    clientPosition: Vector2;
    scenePosition: Vector2;
  };
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
    };
  }
): WorldScene => {
  const sceneSizeX = config?.worldScene?.size?.x ?? 2000;
  const sceneSizeY = config?.worldScene?.size?.y ?? 1000;

  // ## Container
  const sceneContainer = new Container({
    isRenderGroup: true,
  });

  // # Camera
  const scale = config?.camera?.scale ?? 1;
  const position = {
    x: config?.camera?.position?.x ?? 0,
    y: config?.camera?.position?.y ?? 0,
  };
  const size = {
    width: config?.camera?.width ?? 0,
    height: config?.camera?.height ?? 0,
  };

  const camera: Camera = {
    position: {
      x: position.x,
      y: position.y,
    },
    scaled: {
      position: {
        x: position.x / scale,
        y: position.y / scale,
      },
      size: {
        width: size.width / scale,
        height: size.height / scale,
      },
    },
    scale,
    width: size.width,
    height: size.height,
    target: {
      scale,
    },
  };

  // ## On resize change camera last coordinates
  app.canvas.addEventListener('resize', () => {
    camera.width = app.renderer.width;
    camera.height = app.renderer.width;

    // TODO: Maybe move
    if (camera.position.x > worldScene.size.width - camera.width) {
      camera.position.x = worldScene.size.width - camera.width;
    }

    if (camera.position.y > worldScene.size.height - camera.height) {
      camera.position.y = worldScene.size.height - camera.height;
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
      },
    },
    size: {
      width: sceneSizeX,
      height: sceneSizeY,
    },
    cameras: {
      main: camera,
    },
  };

  (globalThis as any).__TECS_WORLD_SCENE__ = worldScene;

  return worldScene;
};

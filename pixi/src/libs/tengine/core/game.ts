import { Application, ApplicationOptions, Container } from 'pixi.js';
import { Size } from './types';
import { Camera, newCamera, NewCameraProps } from './camera';
import { MouseInput, newMouseInput } from './input';

export type GameCanvas = {
  parentElement: HTMLElement;
  size: Size;
  element: HTMLCanvasElement;
  resizeTo?: HTMLElement | Window;
};

export type Game = {
  app: Application;
  canvas: GameCanvas;
  container: Container;
  size: Size;
  input: {
    mouse: MouseInput;
  };
  cameras: {
    main: Camera;
  };
};

export const newGame = (
  props: {
    app?: Application;
    canvas?: Partial<Omit<GameCanvas, 'element'>>;
    camera?: NewCameraProps;
    size?: Size;
  } = {}
): Game => {
  // # App
  const app = props.app ?? new Application();

  // # Container
  const container = new Container({
    isRenderGroup: true,
    label: 'game',
  });

  // # Add container to App
  app.stage.addChild(container);

  // # World size
  const worldSize = {
    width: props.size?.width ?? window.innerWidth,
    height: props.size?.height ?? window.innerHeight,
  };

  // # Camera
  const camera = newCamera({
    ...props.camera,
    size: props.camera?.size ?? worldSize,
  });

  // # Add parent html element
  let parent = props.canvas?.parentElement;

  if (!parent) {
    const parentElement = document.createElement('div');
    document.body.append(parentElement);
    parent = parentElement;
  }

  const game: Game = {
    app,
    canvas: {
      parentElement: parent,
      size: {
        width: props.canvas?.size?.width ?? window.innerWidth,
        height: props.canvas?.size?.height ?? window.innerHeight,
      },
      resizeTo: props.canvas?.resizeTo,
      element: undefined as unknown as HTMLCanvasElement,
    },
    container: container,
    input: {
      mouse: newMouseInput(),
    },
    size: worldSize,
    cameras: {
      main: camera,
    },
  };

  if ((globalThis as any).__TENGINE_GAME__) {
    (globalThis as any).__TENGINE_GAME__.push(game);
  } else {
    (globalThis as any).__TENGINE_GAMES__ = [game];
  }

  return game;
};

export async function initGame(game: Game, options: Partial<ApplicationOptions> = {}) {
  await game.app.init({
    ...options,
    width: game.canvas.size.width,
    height: game.canvas.size.width,
    resizeTo: game.canvas.resizeTo,
  });

  game.canvas.element = game.app.canvas;
  game.canvas.parentElement.appendChild(game.app.canvas);
}

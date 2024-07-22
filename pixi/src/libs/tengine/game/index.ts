import { Application, ApplicationOptions, Container } from 'pixi.js';
import { Size } from '../core/types';
import { Camera, newCamera, NewCameraProps } from '../core/camera';
import { MouseInput, newMouseInput } from '../core/input';
import { Essence, newEssence, run as runEssence, step, stepWithTicker } from '../../tecs';

export type GameCanvas = {
  parentElement: HTMLElement;
  size: Size;
  element: HTMLCanvasElement;
  resizeTo?: HTMLElement | Window;
};

export type GameWorld = {
  container: Container;
  size: Size;
};

export type Game = {
  app: Application;
  canvas: GameCanvas;
  world: GameWorld;
  input: {
    mouse: MouseInput;
  };
  camera: {
    main: Camera;
  };
  essence: Essence;
};

export const newGame = (
  props: {
    app?: Application;
    canvas?: Partial<Omit<GameCanvas, 'element'>>;
    camera?: NewCameraProps;
    world?: Partial<GameWorld>;
    essence?: Essence;
  } = {}
): Game => {
  // # App
  const app = props.app ?? new Application();
  (globalThis as any).__PIXI_APP__ = app;

  // # Container
  const world: GameWorld = {
    container: new Container({
      isRenderGroup: true,
      label: 'game',
    }),
    size: {
      width: props.world?.size?.width ?? window.innerWidth,
      height: props.world?.size?.height ?? window.innerHeight,
    },
  };

  // # Add container to App
  app.stage.addChild(world.container);

  // # Camera
  const camera = newCamera({
    ...props.camera,
    size: {
      width: props.camera?.size?.width ?? window.innerWidth,
      height: props.camera?.size?.height ?? window.innerHeight,
    },
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
    world,
    input: {
      mouse: newMouseInput(),
    },
    camera: {
      main: camera,
    },
    essence: props.essence ?? newEssence(),
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
    // autoStart: false,
    ...options,
    width: game.canvas.size.width,
    height: game.canvas.size.width,
    resizeTo: game.canvas.resizeTo,
  });

  game.canvas.element = game.app.canvas;
  game.canvas.parentElement.appendChild(game.canvas.element);
}

export function run(game: Game) {
  game.app.ticker.add((ticker) => {
    stepWithTicker(game.essence, ticker);
  });
}

export const Game = {
  new: newGame,
  init: initGame,
  run,
};

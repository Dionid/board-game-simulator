import { Application, ApplicationOptions, Container, Ticker } from 'pixi.js';
import { Size2 } from '../core/types';
import { Camera, newCamera, NewCameraProps } from '../core/camera';
import { KeyBoardInput, MouseInput, newMouseInput } from '../core/input';
import { destroyEssence, Essence, newEssence, stepWithTicker } from '../../tecs';
import { mutableEmpty } from 'libs/tecs/array';
import { Sleep } from 'libs/sleep';

export type GameCanvas = {
  parentElement: HTMLElement;
  size: Size2;
  element: HTMLCanvasElement;
  resizeTo?: HTMLElement | Window;
};

export type GameWorld = {
  container: Container;
  size: Size2;
};

export type Game = {
  app: Application;
  canvas: GameCanvas;
  world: GameWorld;
  input: {
    mouse: MouseInput;
    keyboard: KeyBoardInput;
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
  const worldSize = {
    width: props.world?.size?.width ?? window.innerWidth,
    height: props.world?.size?.height ?? window.innerHeight,
  };

  const world: GameWorld = {
    container: new Container({
      isRenderGroup: true,
      label: 'game',
    }),
    size: worldSize,
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
      keyboard: {
        keyDown: {},
        keyUp: [],
      },
    },
    camera: {
      main: camera,
    },
    essence: props.essence ?? newEssence(),
  };

  if ((globalThis as any).__TENGINE_GAMES__) {
    (globalThis as any).__TENGINE_GAMES__.push(game);
  } else {
    (globalThis as any).__TENGINE_GAMES__ = [game];
  }

  return game;
};

export async function initGame(game: Game, options: Partial<ApplicationOptions> = {}) {
  await game.app.init({
    ...options,
    width: game.canvas.size.width,
    height: game.canvas.size.height,
    resizeTo: game.canvas.resizeTo,
  });

  game.canvas.element = game.app.canvas;
  game.canvas.parentElement.appendChild(game.canvas.element);
}

export function run(game: Game) {
  const _run = (ticker: Ticker) => {
    stepWithTicker(game.essence, ticker);
  };

  game.app.ticker.add(_run);

  return () => {
    game.app.ticker.remove(_run);
  };
}

export function destroyGame(game: Game): void {
  game.app.stop();

  if (game.essence.state !== 'idle') {
    throw new Error('Game is not idle');
  }

  destroyEssence(game.essence);

  (globalThis as any).__TENGINE_GAMES__ = (globalThis as any).__TENGINE_GAMES__.filter(
    (g: any) => g !== game
  );

  (globalThis as any).__PIXI_APP__ = undefined;
}

export const Game = {
  new: newGame,
  init: initGame,
  destroy: destroyGame,
  run,
};

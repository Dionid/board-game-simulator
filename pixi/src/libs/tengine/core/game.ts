import { Application, ApplicationOptions, Container } from 'pixi.js';
import { Map } from '../tilemap';
import { Size, Vector2 } from './types';
import { Camera, newCamera, NewCameraProps } from './camera';
import { MouseInput, newMouseInput } from './input';

export type Game = {
  app: Application;
  map: Map<any>;
  parent: HTMLElement;
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
  map: Map<any>,
  props: {
    app?: Application;
    parent?: HTMLElement;
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

  // # Add Map
  container.addChild(map.container);

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
  let parent = props.parent;

  if (!parent) {
    const parentElement = document.createElement('div');
    document.body.append(parentElement);
    parent = parentElement;
  }

  const game: Game = {
    app,
    map,
    parent,
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
  await game.app.init(options);

  game.parent.appendChild(game.app.canvas);
}

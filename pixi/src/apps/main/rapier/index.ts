import { Container } from 'pixi.js';
import { initGame, newGame } from '../../../libs/tengine/game';
import { registerSystem, setComponent, spawnEntity } from '../../../libs/tecs';
import { mapKeyboardInput, mapMouseInput } from '../../../libs/tengine/ecs';
import { Player } from './ecs';
import { drawViews, View, drawDebugLines } from 'libs/tengine/render';

export async function initPongGame(parentElement: HTMLElement) {
  const game = newGame({
    canvas: {
      parentElement,
      resizeTo: window,
    },
  });

  await initGame(game, {
    backgroundColor: 0x000000,
  });

  const map = {
    container: new Container({
      label: 'map',
    }),
  };

  game.world.container.addChild(map.container);

  // # Initial Game Objects
  const characterSize = {
    width: 50,
    height: 100,
  };

  // # Player
  const playerEntity = spawnEntity(game.essence);

  // # Game Object
  setComponent(game.essence, playerEntity, Player);
  // # Position
  // setComponent(game.essence, playerEntity, Position2, {
  //   x: game.world.size.width / 6 - characterSize.width / 2,
  //   y: game.world.size.height / 2 - characterSize.height / 2,
  // });
  // # Acceleration based Movement
  // setComponent(game.essence, playerEntity, Speed, { value: 1 });
  // setComponent(game.essence, playerEntity, Acceleration2, {
  //   x: 0,
  //   y: 0,
  // });
  // setComponent(game.essence, playerEntity, Velocity2, {
  //   x: 0,
  //   y: 0,
  // });
  // # Visuals
  setComponent(game.essence, playerEntity, View, {
    offset: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    model: {
      type: 'graphics',
      color: 'blue',
      shape: {
        type: 'rectangle',
        size: {
          width: characterSize.width,
          height: characterSize.height,
        },
      },
    },
  });

  // # Systems
  // ...
  // ## Input
  registerSystem(game.essence, mapKeyboardInput(game));
  registerSystem(game.essence, mapMouseInput(game, map));

  // ## Game logic
  // registerSystem(game.essence, accelerateByArrows(game, playerEntity));

  // ## Render
  registerSystem(game.essence, drawViews(game, map));
  registerSystem(
    game.essence,
    drawDebugLines(game, map, {
      view: false,
      xy: true,
      collision: false,
    })
  );

  return game;
}

import { Container, Graphics } from 'pixi.js';
import { initGame, newGame } from '../../../libs/tengine/game';
import { registerSystem } from '../../../libs/tecs';
import { mapKeyboardInput, mapMouseInput } from '../../../libs/tengine/ecs';
import { moveByArrows } from './ecs';

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

  const characterSize = {
    width: 50,
    height: 200,
  };

  const player = new Graphics().rect(
    game.world.size.width / 6 - characterSize.width / 2,
    game.world.size.height / 2 - characterSize.height / 2,
    characterSize.width,
    characterSize.height
  );
  player.label = 'player';
  player.fill(0xfff);
  map.container.addChild(player);

  const enemy = new Graphics().rect(
    (game.world.size.width / 6) * 5 - characterSize.width / 2,
    game.world.size.height / 2 - characterSize.height / 2,
    characterSize.width,
    characterSize.height
  );
  enemy.label = 'enemy';
  enemy.fill(0xff0000);
  map.container.addChild(enemy);

  // # Systems
  // ## Input
  registerSystem(game.essence, mapKeyboardInput(game));
  registerSystem(game.essence, mapMouseInput(game, map));
  // ## Movement
  registerSystem(game.essence, moveByArrows(game));

  return game;
}

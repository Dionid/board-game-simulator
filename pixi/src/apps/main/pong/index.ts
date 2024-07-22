import { Graphics } from 'pixi.js';
import { initGame, newGame } from '../../../libs/tengine/game';
import { registerSystem } from '../../../libs/tecs';
import { render } from '../../../libs/tengine/ecs';

export async function initPongGame(parentElement: HTMLElement) {
  const game = newGame({
    canvas: {
      parentElement,
    },
  });

  await initGame(game, {
    backgroundColor: 0x000000,
  });

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
  player.fill(0xfff);
  game.world.container.addChild(player);

  const enemy = new Graphics().rect(
    (game.world.size.width / 6) * 5 - characterSize.width / 2,
    game.world.size.height / 2 - characterSize.height / 2,
    characterSize.width,
    characterSize.height
  );
  enemy.fill(0xff0000);
  game.world.container.addChild(enemy);

  // # Systems
  // ...

  return game;
}

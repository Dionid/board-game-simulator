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

  const player = new Graphics().rect(0, 0, 50, 100);
  player.fill(0xde3249);
  game.world.container.addChild(player);

  // # Render
  registerSystem(game.essence, render(game), 'postUpdate');

  return game;
}

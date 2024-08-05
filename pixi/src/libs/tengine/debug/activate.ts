import { registerSystem } from 'libs/tecs';
import { Game } from '../game';
import { DEBUG } from './core';
import { drawDebugLines } from './render';

export function activateDebugMode(
  game: Game,
  options: {
    render?: {
      view?: boolean;
      xy?: boolean;
      collision?: boolean;
      velocity?: boolean;
      acceleration?: boolean;
    };
  } = {}
) {
  DEBUG.isActive = true;

  registerSystem(game.essence, drawDebugLines(game, options.render || {}), {
    stage: 'postUpdate',
  });
}

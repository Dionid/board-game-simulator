import { System } from '../../tecs';
import { Game } from '../game';

export const render = (game: Game): System => {
  return () => {
    game.app.render();
  };
};

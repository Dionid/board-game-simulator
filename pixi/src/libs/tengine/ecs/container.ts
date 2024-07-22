import { System } from '../../tecs';
import { Game } from '../game';

export const applyCameraToContainer = (game: Game): System => {
  const camera = game.cameras.main;
  const container = game.world.container;

  return () => {
    // # Position
    // # NEED TO BE UNSCALED
    container.x = -camera.position.x;
    container.y = -camera.position.y;
    // # Scale
    container.scale.x = camera.scale;
    container.scale.y = camera.scale;
  };
};

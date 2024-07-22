import { System } from '../../tecs';
import { Game } from '../game';

export const applyCameraToWorld = (game: Game): System => {
  const camera = game.camera.main;
  const { container } = game.world;

  return () => {
    // # Position
    // # NEED TO BE UNSCALED
    container.x = -camera.position.x;
    container.y = -camera.position.y;

    // # Scale world by camera scale and size
    // const scale = Math.min(
    //   (window.innerWidth / camera.size.width) * camera.scale,
    //   (window.innerHeight / camera.size.height) * camera.scale
    // );
    // container.scale = scale;
    // # Scale world by camera scale and size
    container.scale.x = (window.innerWidth / camera.size.width) * camera.scale.x;
    container.scale.y = (window.innerHeight / camera.size.height) * camera.scale.y;
    // ---
    // container.scale.x = camera.scale;
    // container.scale.y = camera.scale;
  };
};

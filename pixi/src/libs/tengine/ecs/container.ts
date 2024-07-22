import { System } from '../../tecs';
import { Game } from '../core';

export const applyCameraToContainer = (worldScene: Game): System => {
  const camera = worldScene.cameras.main;
  const container = worldScene.container;

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

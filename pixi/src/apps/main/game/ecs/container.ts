import { System } from '../../../../libs/tecs';
import { WorldScene } from '../../../../libs/tengine';

export const applyCameraToContainer = (worldScene: WorldScene): System => {
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

import { Square, Vector2 } from '../math';

export type Camera = Square;

export const Camera = {
  inCameraView: (cameraPosition: Camera, position: Vector2): Vector2 => {
    return {
      x: cameraPosition.x + position.x,
      y: cameraPosition.y + position.y,
    };
  },
};

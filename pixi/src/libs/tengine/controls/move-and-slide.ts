import { Vector2 } from '../core';

export type CorrectedVelocity2 = Vector2;

export function moveAndSlide(
  velocity: Vector2,
  position: Vector2,
  offset: number = 0.01,
  maxDepth: number = 5,
  depth: number = 0
): CorrectedVelocity2 {
  if (depth >= maxDepth) {
    return velocity;
  }

  return velocity;
}

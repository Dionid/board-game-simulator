import { lineCircleClosestPoint } from '../collision';
import { normalizeV2, subV2, dotV2, multV2, Position2, Velocity2, unitV2 } from '../core';

export function resolveCircleCircleCollision(
  elasticity: number,
  aPosition: Position2,
  aVelocity: Velocity2,
  aInvertedMass: number,
  bPosition: Position2,
  bVelocity: Velocity2,
  bInvertedMass: number,
  combinedInvertedMass: number
) {
  // # Relative direction vector from a to b
  const normalizedDirection = normalizeV2(subV2(aPosition, bPosition));

  // # Projection of velocities on the relative vector
  const velocitySeparation = dotV2(subV2(aVelocity, bVelocity), normalizedDirection);

  // # Calculate the separation velocity with elasticity
  const velocitySeparationWithElasticity = -1 * velocitySeparation * elasticity;

  const velocitySeparationDiff = velocitySeparationWithElasticity - velocitySeparation;

  const impulse = velocitySeparationDiff / combinedInvertedMass;

  const impulseVector = multV2(normalizedDirection, impulse);

  aVelocity.x += impulseVector.x * aInvertedMass;
  aVelocity.y += impulseVector.y * aInvertedMass;

  bVelocity.x -= impulseVector.x * bInvertedMass;
  bVelocity.y -= impulseVector.y * bInvertedMass;
}

export function resolveCircleLineCollision(
  elasticity: number,
  circlePosition: Position2,
  circleVelocity: Velocity2,
  circleInvertedMass: number,
  lineStart: Position2,
  lineEnd: Position2,
  lineVelocity: Velocity2,
  lineInvertedMass: number,
  combinedInvertedMass: number
) {
  const normalizedDirection = unitV2(
    subV2(circlePosition, lineCircleClosestPoint(lineStart, lineEnd, circlePosition))
  );

  const separationVelocity = dotV2(subV2(circleVelocity, lineVelocity), normalizedDirection);

  const separationVelocityWithElasticity = -1 * separationVelocity * elasticity;

  const separationVelocityDiff = separationVelocityWithElasticity - separationVelocity;

  // circleVelocity.x -= separationVelocityDiff * normal.x;
  // circleVelocity.y -= separationVelocityDiff * normal.y;

  const impulse = separationVelocityDiff / combinedInvertedMass;

  const impulseVector = multV2(normalizedDirection, impulse);

  circleVelocity.x += impulseVector.x * circleInvertedMass;
  circleVelocity.y += impulseVector.y * circleInvertedMass;

  lineVelocity.x -= impulseVector.x * lineInvertedMass;
  lineVelocity.y -= impulseVector.y * lineInvertedMass;
}

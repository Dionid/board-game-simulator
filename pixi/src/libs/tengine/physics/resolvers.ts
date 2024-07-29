import { normalizeV2, subV2, dotV2, multV2, Position2, Velocity2 } from '../core';

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

// export function resolveCircleCircleCollision(
//     elasticity: number,
//     aPosition: Position2,
//     aVelocity: Velocity2,
//     aInvertedMass: number,
//     bPosition: Position2,
//     bVelocity: Velocity2,
//     bInvertedMass: number,
//     combinedInvertedMass: number
//   ) {
//     // # Relative direction vector from a to b
//     const normalizedDirection = normalizeV2(subV2(aPosition, bPosition));

//     // # Projection of velocities on the relative vector
//     const velocitySeparation = dotV2(subV2(aVelocity, bVelocity), normalizedDirection);

//     // # Calculate the separation velocity with elasticity
//     const velocitySeparationWithElasticity = -1 * velocitySeparation * elasticity;

//     const velocitySeparationDiff = velocitySeparationWithElasticity - velocitySeparation;

//     const impulse = velocitySeparationDiff / combinedInvertedMass;

//     const impulseVector = multV2(normalizedDirection, impulse);

//     aVelocity.x += impulseVector.x * aInvertedMass;
//     aVelocity.y += impulseVector.y * aInvertedMass;

//     bVelocity.x -= impulseVector.x * bInvertedMass;
//     bVelocity.y -= impulseVector.y * bInvertedMass;
//   }

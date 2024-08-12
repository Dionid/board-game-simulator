import { Component } from 'libs/tecs';
import { ColliderBody } from './components';
import { inverseMass } from './math';
import { Axis2, multV2, mutAddV2, mutSubV2, Position2 } from '../core';
import { translateCollider } from './collider-transform';

export function resolvePenetration(
  axis: Axis2,
  overlap: number,
  aColliderSet: Component<typeof ColliderBody>,
  aPosition: Position2,
  aTotalMass: number,
  bColliderSet: Component<typeof ColliderBody>,
  bPosition: Position2,
  bTotalMass: number
) {
  const aInvertedMass = inverseMass(aTotalMass);
  const bInvertedMass = inverseMass(bTotalMass);
  const combinedInvertedMass = aInvertedMass + bInvertedMass;

  if (combinedInvertedMass === 0) {
    return;
  }

  const resolution = multV2(axis, overlap / combinedInvertedMass);

  const aPrevPosition = {
    x: aPosition.x,
    y: aPosition.y,
  };
  const bPrevPosition = {
    x: bPosition.x,
    y: bPosition.y,
  };

  // # Apply changes to position
  if (aTotalMass > 0) {
    mutAddV2(aPosition, multV2(resolution, aInvertedMass));

    const aPositionDelta = {
      x: aPosition.x - aPrevPosition.x,
      y: aPosition.y - aPrevPosition.y,
    };

    // # Apply changes to colliders
    for (const collider of aColliderSet.parts) {
      translateCollider(collider, aPositionDelta);
    }
  }

  if (bTotalMass > 0) {
    mutSubV2(bPosition, multV2(resolution, bInvertedMass));

    const bPositionDelta = {
      x: bPosition.x - bPrevPosition.x,
      y: bPosition.y - bPrevPosition.y,
    };

    for (const collider of bColliderSet.parts) {
      translateCollider(collider, bPositionDelta);
    }
  }
}

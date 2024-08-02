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
  bColliderSet: Component<typeof ColliderBody>,
  bPosition: Position2,
  options: {
    aMass?: number;
    bMass?: number;
  } = {}
) {
  const aTotalMass =
    options.aMass ??
    aColliderSet.parts.reduce((acc, cur) => {
      acc += cur.mass;
      return acc;
    }, 0);
  const bTotalMass =
    options.bMass ??
    bColliderSet.parts.reduce((acc, cur) => {
      acc += cur.mass;
      return acc;
    }, 0);

  const aInvertedMass = inverseMass(aTotalMass);
  const bInvertedMass = inverseMass(bTotalMass);
  const combinedInvertedMass = aInvertedMass + bInvertedMass;

  const resolution = multV2(axis, overlap / combinedInvertedMass);

  const aPrevPosition = {
    x: aPosition.x,
    y: aPosition.y,
  };
  const bPrevPosition = {
    x: bPosition.x,
    y: bPosition.y,
  };

  mutAddV2(aPosition, multV2(resolution, aInvertedMass));
  mutSubV2(bPosition, multV2(resolution, bInvertedMass));

  const aPositionDelta = {
    x: aPosition.x - aPrevPosition.x,
    y: aPosition.y - aPrevPosition.y,
  };

  const bPositionDelta = {
    x: bPosition.x - bPrevPosition.x,
    y: bPosition.y - bPrevPosition.y,
  };

  for (const collider of aColliderSet.parts) {
    translateCollider(collider, aPositionDelta);
  }

  // translateCollider(aCollider, aPositionDelta);
  // translateCollider(bCollider, bPositionDelta);

  for (const collider of bColliderSet.parts) {
    translateCollider(collider, bPositionDelta);
  }
}

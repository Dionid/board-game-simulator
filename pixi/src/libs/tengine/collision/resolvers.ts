import { Component } from 'libs/tecs';
import { Collider } from './components';
import { inverseMass } from './math';
import { Axis2, multV2, mutAddV2, mutSubV2, Position2 } from '../core';
import { translateCollider } from './collider-transform';

export function resolvePenetration(
  axis: Axis2,
  overlap: number,
  aCollider: Component<typeof Collider>,
  aPosition: Position2,
  bCollider: Component<typeof Collider>,
  bPosition: Position2
) {
  const aInvertedMass = inverseMass(aCollider.mass);
  const bInvertedMass = inverseMass(bCollider.mass);
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

  translateCollider(aCollider, aPositionDelta);
  translateCollider(bCollider, bPositionDelta);
}

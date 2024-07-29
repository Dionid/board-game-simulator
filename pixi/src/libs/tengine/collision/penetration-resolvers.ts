import { KindToType } from 'libs/tecs';
import { normalizeV2, multV2, mutAddV2, mutSubV2, Position2 } from '../core';
import { ColliderShape } from './components';

export function resolvePenetration(
  aPosition: Position2,
  aMass: number,
  aColliderShape: KindToType<typeof ColliderShape>,
  bPosition: Position2,
  bMass: number,
  bColliderShape: KindToType<typeof ColliderShape>,
  depth: number
): void {
  const aInvertedMass = aMass === 0 ? 0 : 1 / aMass;
  const bInvertedMass = bMass === 0 ? 0 : 1 / bMass;

  // # Circle Circle Collision Resolution
  if (aColliderShape.type === 'circle' && bColliderShape.type === 'circle') {
    if (aMass + bMass === 0) {
      return;
    }

    const normDist = normalizeV2({
      x: aPosition.x - bPosition.x,
      y: aPosition.y - bPosition.y,
    });

    const resolution = multV2(normDist, depth / (aInvertedMass + bInvertedMass));

    mutAddV2(aPosition, multV2(resolution, aInvertedMass));
    mutSubV2(bPosition, multV2(resolution, bInvertedMass));

    return;
  }

  // # Rectangle Rectangle Collision Resolution
  if (
    aColliderShape.type === 'constant_rectangle' &&
    bColliderShape.type === 'constant_rectangle'
  ) {
    const rightLeftEdgeDistance = Math.abs(aPosition.x + aColliderShape.width - bPosition.x);
    const leftRightEdgeDistance = Math.abs(aPosition.x - (bPosition.x + bColliderShape.width));
    const topBottomEdgeDistance = Math.abs(aPosition.y + aColliderShape.height - bPosition.y);
    const bottomTopEdgeDistance = Math.abs(aPosition.y - (bPosition.y + bColliderShape.height));

    const comingFromBottom =
      bottomTopEdgeDistance < topBottomEdgeDistance &&
      bottomTopEdgeDistance < rightLeftEdgeDistance &&
      bottomTopEdgeDistance < leftRightEdgeDistance;
    const comingFromTop =
      topBottomEdgeDistance < bottomTopEdgeDistance &&
      topBottomEdgeDistance < rightLeftEdgeDistance &&
      topBottomEdgeDistance < leftRightEdgeDistance;
    const comingFromLeft =
      rightLeftEdgeDistance < leftRightEdgeDistance &&
      rightLeftEdgeDistance < topBottomEdgeDistance &&
      rightLeftEdgeDistance < bottomTopEdgeDistance;
    const comingFromRight =
      leftRightEdgeDistance < rightLeftEdgeDistance &&
      leftRightEdgeDistance < topBottomEdgeDistance &&
      leftRightEdgeDistance < bottomTopEdgeDistance;

    if (!comingFromBottom && !comingFromTop && !comingFromLeft && !comingFromRight) {
      debugger;
    }

    const resolutionDirection = {
      x: comingFromLeft ? -1 : comingFromRight ? 1 : 0,
      y: comingFromTop ? -1 : comingFromBottom ? 1 : 0,
    };

    const resolution = multV2(resolutionDirection, depth / (aInvertedMass + bInvertedMass));

    mutAddV2(aPosition, multV2(resolution, aInvertedMass));
    mutSubV2(bPosition, multV2(resolution, bInvertedMass));

    // if (aImmovable) {
    //   const resolution = multV2(resolutionDirection, depth);

    //   mutSubV2(bPosition, resolution);
    // } else if (bImmovable) {
    //   const resolution = multV2(resolutionDirection, depth);

    //   mutAddV2(aPosition, resolution);
    // } else {
    //   const resolution = multV2(resolutionDirection, depth / 2);

    //   mutAddV2(aPosition, resolution);
    //   mutSubV2(bPosition, resolution);
    // }

    return;
  }

  // # Circle Rectangle Collision Resolution
  if (
    (aColliderShape.type === 'circle' && bColliderShape.type === 'constant_rectangle') ||
    (aColliderShape.type === 'constant_rectangle' && bColliderShape.type === 'circle')
  ) {
    const circleShape =
      aColliderShape.type === 'circle'
        ? aColliderShape
        : bColliderShape.type === 'circle'
        ? bColliderShape
        : null;
    const rectShape =
      aColliderShape.type === 'constant_rectangle'
        ? aColliderShape
        : bColliderShape.type === 'constant_rectangle'
        ? bColliderShape
        : null;

    if (!circleShape || !rectShape) {
      throw new Error('Invalid collider shape');
    }

    const circlePosition = aColliderShape.type === 'circle' ? aPosition : bPosition;
    const rectPosition = bColliderShape.type === 'constant_rectangle' ? bPosition : aPosition;

    const comingFromTop = circlePosition.y < rectPosition.y;
    const comingFromBottom = circlePosition.y > rectPosition.y + rectShape.height;

    const comingFromLeft = circlePosition.x < rectPosition.x;
    const comingFromRight = circlePosition.x > rectPosition.x + rectShape.width;

    const resolutionDirection = {
      x: comingFromLeft ? -1 : comingFromRight ? 1 : 0,
      y: comingFromTop ? -1 : comingFromBottom ? 1 : 0,
    };

    const resolution = multV2(resolutionDirection, depth / (aInvertedMass + bInvertedMass));

    mutAddV2(circlePosition, multV2(resolution, aInvertedMass));
    mutSubV2(rectPosition, multV2(resolution, bInvertedMass));

    // const circleImmovable =
    //   aColliderShape.type === 'circle'
    //     ? aImmovable
    //     : bColliderShape.type === 'circle'
    //     ? bImmovable
    //     : null;

    // const rectImmovable =
    //   aColliderShape.type === 'constant_rectangle'
    //     ? aImmovable
    //     : bColliderShape.type === 'constant_rectangle'
    //     ? bImmovable
    //     : null;

    // if (circleImmovable) {
    //   const resolution = multV2(resolutionDirection, depth);

    //   mutSubV2(rectPosition, resolution);
    // } else if (rectImmovable) {
    //   const resolution = multV2(resolutionDirection, depth);

    //   mutAddV2(circlePosition, resolution);
    // } else {
    //   const resolution = multV2(resolutionDirection, depth / 2);

    //   mutAddV2(circlePosition, resolution);
    //   mutSubV2(rectPosition, resolution);
    // }

    return;
  }
}

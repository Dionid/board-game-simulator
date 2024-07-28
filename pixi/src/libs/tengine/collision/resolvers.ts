import { KindToType } from 'libs/tecs';
import { normalizeV2, multScalarV2, mutAddV2, mutSubV2, Position2 } from '../core';
import { ColliderShape } from './components';

export function resolvePenetration(
  aPosition: Position2,
  aImmovable: boolean,
  aColliderShape: KindToType<typeof ColliderShape>,
  bPosition: Position2,
  bImmovable: boolean,
  bColliderShape: KindToType<typeof ColliderShape>,
  depth: number
) {
  // # Circle Circle Collision Resolution
  if (aColliderShape.type === 'circle' && bColliderShape.type === 'circle') {
    const normDist = normalizeV2({
      x: aPosition.x - bPosition.x,
      y: aPosition.y - bPosition.y,
    });

    if (aImmovable) {
      const resolution = multScalarV2(normDist, depth);

      mutAddV2(bPosition, resolution);
    } else if (bImmovable) {
      const resolution = multScalarV2(normDist, depth);

      mutAddV2(aPosition, resolution);
    } else {
      const resolution = multScalarV2(normDist, depth / 2);

      mutAddV2(aPosition, resolution);
      mutSubV2(bPosition, resolution);
    }

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

    if (aImmovable) {
      const resolution = multScalarV2(resolutionDirection, depth);

      mutSubV2(bPosition, resolution);
    } else if (bImmovable) {
      const resolution = multScalarV2(resolutionDirection, depth);

      mutAddV2(aPosition, resolution);
    } else {
      const resolution = multScalarV2(resolutionDirection, depth / 2);

      mutAddV2(aPosition, resolution);
      mutSubV2(bPosition, resolution);
    }

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

    const circleImmovable =
      aColliderShape.type === 'circle'
        ? aImmovable
        : bColliderShape.type === 'circle'
        ? bImmovable
        : null;

    const rectImmovable =
      aColliderShape.type === 'constant_rectangle'
        ? aImmovable
        : bColliderShape.type === 'constant_rectangle'
        ? bImmovable
        : null;

    const comingFromTop = circlePosition.y < rectPosition.y;
    const comingFromBottom = circlePosition.y > rectPosition.y + rectShape.height;

    const comingFromLeft = circlePosition.x < rectPosition.x;
    const comingFromRight = circlePosition.x > rectPosition.x + rectShape.width;

    const resolutionDirection = {
      x: comingFromLeft ? -1 : comingFromRight ? 1 : 0,
      y: comingFromTop ? -1 : comingFromBottom ? 1 : 0,
    };

    if (circleImmovable) {
      const resolution = multScalarV2(resolutionDirection, depth);

      mutSubV2(rectPosition, resolution);
    } else if (rectImmovable) {
      const resolution = multScalarV2(resolutionDirection, depth);

      mutAddV2(circlePosition, resolution);
    } else {
      const resolution = multScalarV2(resolutionDirection, depth / 2);

      mutAddV2(circlePosition, resolution);
      mutSubV2(rectPosition, resolution);
    }

    return;
  }
}

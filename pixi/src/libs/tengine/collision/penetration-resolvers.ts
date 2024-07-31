import { KindToType } from 'libs/tecs';
import { normalizeV2, multV2, mutAddV2, mutSubV2, Position2, subV2, unitV2 } from '../core';
import { ColliderRectangle, ColliderShape } from './components';
import { safeGuard } from 'libs/tecs/switch';
import { lineCircleClosestPoint } from './checks';
import { inverseMass } from './math';

export function resolveCircleCirclePenetration(
  aPosition: Position2,
  bPosition: Position2,
  depth: number,
  aInvertedMass: number,
  bInvertedMass: number,
  combinedInvertedMass: number
) {
  const unitDist = normalizeV2({
    x: aPosition.x - bPosition.x,
    y: aPosition.y - bPosition.y,
  });

  const resolution = multV2(unitDist, depth / combinedInvertedMass);

  mutAddV2(aPosition, multV2(resolution, aInvertedMass));
  mutSubV2(bPosition, multV2(resolution, bInvertedMass));

  return;
}

export function resolveConstantRectangleConstantRectanglePenetration(
  aPosition: Position2,
  aColliderShape: KindToType<typeof ColliderRectangle>,
  bPosition: Position2,
  bColliderShape: KindToType<typeof ColliderRectangle>,
  depth: number,
  aInvertedMass: number,
  bInvertedMass: number,
  combinedInvertedMass: number
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

  const resolution = multV2(resolutionDirection, depth / combinedInvertedMass);

  mutAddV2(aPosition, multV2(resolution, aInvertedMass));
  mutSubV2(bPosition, multV2(resolution, bInvertedMass));
}

export function resolveConstantRectangleCirclePenetration(
  aPosition: Position2,
  aColliderShape: KindToType<typeof ColliderShape>,
  bPosition: Position2,
  bColliderShape: KindToType<typeof ColliderShape>,
  depth: number,
  aInvertedMass: number,
  bInvertedMass: number,
  combinedInvertedMass: number
) {
  const rectShape =
    aColliderShape.type === 'rectangle'
      ? aColliderShape
      : bColliderShape.type === 'rectangle'
      ? bColliderShape
      : null;

  if (!rectShape) {
    throw new Error('Invalid collider shape');
  }

  const circlePosition = aColliderShape.type === 'circle' ? aPosition : bPosition;
  const rectPosition = bColliderShape.type === 'rectangle' ? bPosition : aPosition;

  const comingFromTop = circlePosition.y < rectPosition.y;
  const comingFromBottom = circlePosition.y > rectPosition.y + rectShape.height;

  const comingFromLeft = circlePosition.x < rectPosition.x;
  const comingFromRight = circlePosition.x > rectPosition.x + rectShape.width;

  const resolutionDirection = {
    x: comingFromLeft ? -1 : comingFromRight ? 1 : 0,
    y: comingFromTop ? -1 : comingFromBottom ? 1 : 0,
  };

  const circleInvertedMass = aColliderShape.type === 'circle' ? aInvertedMass : bInvertedMass;
  const rectInvertedMass = aColliderShape.type === 'rectangle' ? aInvertedMass : bInvertedMass;

  const resolution = multV2(resolutionDirection, depth / combinedInvertedMass);

  mutAddV2(circlePosition, multV2(resolution, circleInvertedMass));
  mutSubV2(rectPosition, multV2(resolution, rectInvertedMass));

  return;
}

export function resolveLineCirclePenetration(
  circlePosition: Position2,
  circleInvertedMass: number,
  lineStart: Position2,
  lineEnd: Position2,
  lineInvertedMass: number,
  depth: number,
  combinedInvertedMass: number
) {
  const closestPoint = lineCircleClosestPoint(lineStart, lineEnd, circlePosition);

  const penetrationVector = subV2(circlePosition, closestPoint);

  const normDist = unitV2(penetrationVector);

  const resolution = multV2(normDist, depth / combinedInvertedMass);

  mutAddV2(circlePosition, multV2(resolution, circleInvertedMass));
  mutSubV2(lineStart, multV2(resolution, lineInvertedMass));
}

export function resolvePenetration(
  aPosition: Position2,
  aMass: number,
  aColliderShape: KindToType<typeof ColliderShape>,
  bPosition: Position2,
  bMass: number,
  bColliderShape: KindToType<typeof ColliderShape>,
  depth: number
): void {
  const aInvertedMass = inverseMass(aMass);
  const bInvertedMass = inverseMass(bMass);
  const combinedInvertedMass = aInvertedMass + bInvertedMass;

  // # If both objects are immovable, skip
  if (combinedInvertedMass === 0) {
    return;
  }

  switch (aColliderShape.type) {
    case 'line':
      switch (bColliderShape.type) {
        case 'circle':
          return resolveLineCirclePenetration(
            bPosition,
            bInvertedMass,
            aPosition,
            {
              x: aPosition.x,
              y: aPosition.y + aColliderShape.length,
            },
            aInvertedMass,
            depth,
            combinedInvertedMass
          );
        case 'rectangle':
          return;
        case 'line':
          return;
        default:
          return safeGuard(bColliderShape);
      }
    case 'circle':
      switch (bColliderShape.type) {
        case 'circle':
          return resolveCircleCirclePenetration(
            aPosition,
            bPosition,
            depth,
            aInvertedMass,
            bInvertedMass,
            combinedInvertedMass
          );
        case 'rectangle':
          return resolveConstantRectangleCirclePenetration(
            aPosition,
            aColliderShape,
            bPosition,
            bColliderShape,
            depth,
            aInvertedMass,
            bInvertedMass,
            combinedInvertedMass
          );
        case 'line':
          return resolveLineCirclePenetration(
            aPosition,
            aInvertedMass,
            bPosition,
            {
              x: bPosition.x,
              y: bPosition.y + bColliderShape.length,
            },
            bInvertedMass,
            depth,
            combinedInvertedMass
          );
        default:
          return safeGuard(bColliderShape);
      }
    case 'rectangle':
      switch (bColliderShape.type) {
        case 'circle':
          return resolveConstantRectangleCirclePenetration(
            aPosition,
            aColliderShape,
            bPosition,
            bColliderShape,
            depth,
            aInvertedMass,
            bInvertedMass,
            combinedInvertedMass
          );
        case 'rectangle':
          return resolveConstantRectangleConstantRectanglePenetration(
            aPosition,
            aColliderShape,
            bPosition,
            bColliderShape,
            depth,
            aInvertedMass,
            bInvertedMass,
            combinedInvertedMass
          );
        case 'line':
          return;
        default:
          return safeGuard(bColliderShape);
      }
    default:
      return safeGuard(aColliderShape);
  }
}

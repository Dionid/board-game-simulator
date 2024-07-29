import { safeGuard } from 'libs/tecs/switch';
import { KindToType } from '../../tecs';
import { dotV2, magV2, multV2, Position2, Size2, subV2, unitV2 } from '../core';
import { Collider } from './components';

export function circlesCollisionDepth(
  positionA: Position2,
  radiusA: number,
  positionB: Position2,
  radiusB: number
) {
  const dx = positionA.x - positionB.x;
  const dy = positionA.y - positionB.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = radiusA + radiusB;

  return minDistance - distance;
}

export function areCircleAndRectangleColliding(
  circlePosition: Position2,
  circleRadius: number,
  rectPosition: Position2,
  rectSize: Size2
): boolean {
  const rectCenter = {
    x: rectPosition.x + rectSize.width / 2,
    y: rectPosition.y + rectSize.height / 2,
  };

  const distance = {
    x: Math.abs(circlePosition.x - rectCenter.x),
    y: Math.abs(circlePosition.y - rectCenter.y),
  };

  if (distance.x > rectSize.width / 2 + circleRadius) {
    return false;
  }

  if (distance.y > rectSize.height / 2 + circleRadius) {
    return false;
  }

  if (distance.x <= rectSize.width / 2) {
    return true;
  }
  if (distance.y <= rectSize.height / 2) {
    return true;
  }

  const cornerDistance_sq =
    (distance.x - rectSize.width / 2) ** 2 + (distance.y - rectSize.height / 2) ** 2;

  return cornerDistance_sq <= circleRadius ** 2;
}

export function circleAndRectangleCollidingDepth(
  circlePosition: Position2,
  circleRadius: number,
  rectPosition: Position2,
  rectSize: Size2
): number {
  const rectCenter = {
    x: rectPosition.x + rectSize.width / 2,
    y: rectPosition.y + rectSize.height / 2,
  };

  const distance = {
    x: Math.abs(circlePosition.x - rectCenter.x),
    y: Math.abs(circlePosition.y - rectCenter.y),
  };

  const minDistanceX = rectSize.width / 2 + circleRadius;
  const minDistanceY = rectSize.height / 2 + circleRadius;

  if (distance.x > minDistanceX) {
    return -1;
  }

  if (distance.y > minDistanceY) {
    return -1;
  }

  if (distance.x <= rectSize.width / 2) {
    return minDistanceY - distance.y;
  }

  if (distance.y <= rectSize.height / 2) {
    return minDistanceX - distance.x;
  }

  const cornerCollidingMagnitude = Math.sqrt(
    (distance.x - rectSize.width / 2) ** 2 + (distance.y - rectSize.height / 2) ** 2
  );

  return circleRadius - cornerCollidingMagnitude;
}

export function lineCircleClosestPoint(
  lineStart: Position2,
  lineEnd: Position2,
  circlePosition: Position2
) {
  // # Normalized vector (direction) of the line from start to end
  const lineDirection = unitV2(subV2(lineEnd, lineStart));

  const circleToLineStartVec = subV2(lineStart, circlePosition);
  if (dotV2(lineDirection, circleToLineStartVec) > 0) {
    return lineStart;
  }

  const lineEndToCircleVec = subV2(circlePosition, lineEnd);

  // # If the dot product is positive, the closest point is the end of the line
  if (dotV2(lineDirection, lineEndToCircleVec) > 0) {
    return lineEnd;
  }

  const closestPointDistance = dotV2(lineDirection, circleToLineStartVec);
  const closestPointVector = multV2(lineDirection, closestPointDistance);

  return subV2(lineStart, closestPointVector);
}

export function lineCircleCollidingDepth(
  lineStart: Position2,
  lineEnd: Position2,
  circlePosition: Position2,
  circleRadius: number
) {
  const closestPoint = lineCircleClosestPoint(lineStart, lineEnd, circlePosition);

  const circleToClosesPointVector = subV2(closestPoint, circlePosition);

  const closestPointMagnitude = magV2(circleToClosesPointVector);

  if (closestPointMagnitude <= circleRadius) {
    // # Collision detected
    return circleRadius - closestPointMagnitude;
  }

  return -1;
}

export function rectanglesCollidingDepth(
  positionA: Position2,
  sizeA: Size2,
  positionB: Position2,
  sizeB: Size2
): number {
  const aRectCenter = {
    x: positionA.x + sizeA.width / 2,
    y: positionA.y + sizeA.height / 2,
  };

  const bRectCenter = {
    x: positionB.x + sizeB.width / 2,
    y: positionB.y + sizeB.height / 2,
  };

  const distance = {
    x: Math.abs(aRectCenter.x - bRectCenter.x),
    y: Math.abs(aRectCenter.y - bRectCenter.y),
  };

  const minDistanceX = sizeA.width / 2 + sizeB.width / 2;
  const minDistanceY = sizeA.height / 2 + sizeB.height / 2;

  if (distance.x > minDistanceX) {
    return -1;
  }

  if (distance.y > minDistanceY) {
    return -1;
  }

  if (distance.x <= minDistanceX) {
    const xOverlap = minDistanceX - distance.x;

    if (distance.y <= minDistanceY) {
      const yOverlap = minDistanceY - distance.y;

      return Math.min(xOverlap, yOverlap);
    }

    return xOverlap;
  }

  if (distance.y <= minDistanceY) {
    debugger;
    return minDistanceX - distance.x;
  }

  // const cornerCollidingMagnitude = Math.sqrt(
  //   (distance.x - rectSize.width / 2) ** 2 + (distance.y - rectSize.height / 2) ** 2
  // );

  // return circleRadius - cornerCollidingMagnitude;

  return -1;
}

export function collidersPenetrationDepth(
  aCollider: KindToType<typeof Collider>,
  bCollider: KindToType<typeof Collider>
): number {
  switch (aCollider.shape.type) {
    case 'circle':
      switch (bCollider.shape.type) {
        case 'circle':
          return circlesCollisionDepth(
            aCollider.position,
            aCollider.shape.radius,
            bCollider.position,
            bCollider.shape.radius
          );
        case 'constant_rectangle':
          return circleAndRectangleCollidingDepth(
            aCollider.position,
            aCollider.shape.radius,
            bCollider.position,
            bCollider.shape
          );
        case 'line':
          return lineCircleCollidingDepth(
            bCollider.position,
            {
              x: bCollider.shape.end.x + bCollider.position.x,
              y: bCollider.shape.end.y + bCollider.position.y,
            },
            aCollider.position,
            aCollider.shape.radius
          );
        default:
          return safeGuard(bCollider.shape);
      }
    case 'constant_rectangle':
      switch (bCollider.shape.type) {
        case 'circle':
          return circleAndRectangleCollidingDepth(
            bCollider.position,
            bCollider.shape.radius,
            aCollider.position,
            aCollider.shape
          );
        case 'constant_rectangle':
          return rectanglesCollidingDepth(
            aCollider.position,
            aCollider.shape,
            bCollider.position,
            bCollider.shape
          );
        case 'line':
          return -1;
        default:
          return safeGuard(bCollider.shape);
      }
    case 'line':
      switch (bCollider.shape.type) {
        case 'circle':
          return lineCircleCollidingDepth(
            aCollider.position,
            {
              x: aCollider.shape.end.x + aCollider.position.x,
              y: aCollider.shape.end.y + aCollider.position.y,
            },
            bCollider.position,
            bCollider.shape.radius
          );
        case 'constant_rectangle':
        case 'line':
          return -1;
        default:
          return safeGuard(bCollider.shape);
      }
    default:
      return safeGuard(aCollider.shape);
  }
}

import { KindToType } from '../../tecs';
import { Position2, Size2 } from '../core';
import { Collider } from './components';

export const circlesCollisionDepth = (
  positionA: Position2,
  radiusA: number,
  positionB: Position2,
  radiusB: number
) => {
  const dx = positionA.x - positionB.x;
  const dy = positionA.y - positionB.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = radiusA + radiusB;

  return minDistance - distance;
};

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
    return 0;
  }

  if (distance.y > minDistanceY) {
    return 0;
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

// // # Check if two rectangles are colliding using AABB algorithm
// export const areRectanglesColliding = (
//   positionA: Position2,
//   sizeA: Size2,
//   positionB: Position2,
//   sizeB: Size2
// ): boolean => {
//   return (
//     positionA.x < positionB.x + sizeB.width &&
//     positionA.x + sizeA.width > positionB.x &&
//     positionA.y < positionB.y + sizeB.height &&
//     positionA.y + sizeA.height > positionB.y
//   );
// };

export const collidersPenetrationDepth = (
  aCollider: KindToType<typeof Collider>,
  bCollider: KindToType<typeof Collider>
): number => {
  const aColliderShape = aCollider.shape;
  const bColliderShape = bCollider.shape;

  if (aCollider.shape.type === 'circle' && bCollider.shape.type === 'circle') {
    return circlesCollisionDepth(
      aCollider.position,
      aCollider.shape.radius,
      bCollider.position,
      bCollider.shape.radius
    );
  }

  if (
    (aCollider.shape.type === 'circle' && bCollider.shape.type === 'constant_rectangle') ||
    (aCollider.shape.type === 'constant_rectangle' && bCollider.shape.type === 'circle')
  ) {
    const circleCollider =
      aColliderShape.type === 'circle'
        ? aCollider
        : bColliderShape.type === 'circle'
        ? bCollider
        : null;
    const rectCollider =
      aColliderShape.type === 'constant_rectangle'
        ? aCollider
        : bColliderShape.type === 'constant_rectangle'
        ? bCollider
        : null;

    if (!circleCollider || !rectCollider) {
      throw new Error('Invalid collider');
    }

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

    return circleAndRectangleCollidingDepth(
      circleCollider.position,
      circleShape.radius,
      rectCollider.position,
      rectShape
    );
  }

  // if (colliderA.shape.type === 'constant_rectangle' && colliderB.shape.type === 'constant_rectangle') {
  //   return areRectanglesColliding(
  //     colliderA.position,
  //     colliderA.size,
  //     colliderB.position,
  //     colliderB.size
  //   );
  // }
  return -1;
};

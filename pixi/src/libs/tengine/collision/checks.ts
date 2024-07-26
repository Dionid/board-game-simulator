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
  circleSize: Size2,
  rectanglePosition: Position2,
  rectangleSize: Size2
): boolean {
  const radius = circleSize.width / 2;

  const dx = Math.abs(circlePosition.x - (rectanglePosition.x + rectangleSize.width / 2));
  const dy = Math.abs(circlePosition.y - (rectanglePosition.y + rectangleSize.height / 2));

  if (dx > rectangleSize.width / 2 + radius) return false;
  if (dy > rectangleSize.height / 2 + radius) return false;

  if (dx <= rectangleSize.width / 2) return true;
  if (dy <= rectangleSize.height / 2) return true;

  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance <= radius + rectangleSize.width / 2;
}

// # Check if two rectangles are colliding using AABB algorithm
export const areRectanglesColliding = (
  positionA: Position2,
  sizeA: Size2,
  positionB: Position2,
  sizeB: Size2
) => {
  if (
    positionA.x < positionB.x + sizeB.width &&
    positionA.x + sizeA.width > positionB.x &&
    positionA.y < positionB.y + sizeB.height &&
    positionA.y + sizeA.height > positionB.y
  ) {
    return 0;
  }

  return -1;
};

export const compareColliders = (
  colliderA: KindToType<typeof Collider>,
  colliderB: KindToType<typeof Collider>
): number => {
  if (colliderA.shape.type === 'circle' && colliderB.shape.type === 'circle') {
    return circlesCollisionDepth(
      colliderA.position,
      colliderA.shape.radius,
      colliderB.position,
      colliderB.shape.radius
    );
  }
  // if (
  //   (colliderA.shape.type === 'circle' && colliderB.shape.type === 'rectangle') ||
  //   (colliderA.shape.type === 'rectangle' && colliderB.shape.type === 'circle')
  // ) {
  //   if (
  //     areCircleAndRectangleColliding(
  //       colliderA.shape.type === 'circle' ? colliderA.position : colliderB.position,
  //       colliderA.shape.type === 'circle' ? colliderA.size : colliderB.size,
  //       colliderA.shape.type === 'rectangle' ? colliderA.position : colliderB.position,
  //       colliderA.shape.type === 'rectangle' ? colliderA.size : colliderB.size
  //     )
  //   ) {
  //     return circleAndRectanglePenetrationDepth(
  //       colliderA.shape.type === 'circle' ? colliderA.position : colliderB.position,
  //       colliderA.shape.type === 'circle' ? colliderA.size : colliderB.size,
  //       colliderA.shape.type === 'rectangle' ? colliderA.position : colliderB.position,
  //       colliderA.shape.type === 'rectangle' ? colliderA.size : colliderB.size
  //     );
  //   }
  // }
  // if (colliderA.shape.type === 'rectangle' && colliderB.shape.type === 'rectangle') {
  //   return areRectanglesColliding(
  //     colliderA.position,
  //     colliderA.size,
  //     colliderB.position,
  //     colliderB.size
  //   );
  // }
  return -1;
};

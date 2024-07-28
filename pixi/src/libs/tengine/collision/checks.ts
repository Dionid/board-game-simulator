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

// # Check if two rectangles are colliding using AABB algorithm
export const areRectanglesColliding = (
  positionA: Position2,
  sizeA: Size2,
  positionB: Position2,
  sizeB: Size2
): boolean => {
  return (
    positionA.x < positionB.x + sizeB.width &&
    positionA.x + sizeA.width > positionB.x &&
    positionA.y < positionB.y + sizeB.height &&
    positionA.y + sizeA.height > positionB.y
  );
};

export const collidersPenetrationDepth = (
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

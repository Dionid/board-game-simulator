import { KindToType } from '../../tecs';
import { Position2, Size2 } from '../core';
import { Collider } from './components';

export const areCirclesColliding = (
  positionA: Position2,
  sizeA: Size2,
  positionB: Position2,
  sizeB: Size2
) => {
  const dx = positionA.x - positionB.x;
  const dy = positionA.y - positionB.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = sizeA.width / 2 + sizeB.width / 2;

  // return distance < minDistance;
  return minDistance - distance;
};

// export const areCircleAndRectangleColliding = (
//   circlePosition: Position,
//   circleSize: Size,
//   rectanglePosition: Position,
//   rectangleSize: Size
// ) => {
//   const dx = Math.max(
//     rectanglePosition.x - circlePosition.x,
//     0,
//     circlePosition.x - rectanglePosition.x - rectangleSize.width
//   );
//   const dy = Math.max(
//     rectanglePosition.y - circlePosition.y,
//     0,
//     circlePosition.y - rectanglePosition.y - rectangleSize.height
//   );
//   const distance = Math.sqrt(dx * dx + dy * dy);
//   const minDistance = circleSize.width / 2;

//   // return distance < minDistance;
//   return minDistance - distance;
// };

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

export const circleAndRectanglePenetrationDepth = (
  circlePosition: Position2,
  circleSize: Size2,
  rectanglePosition: Position2,
  rectangleSize: Size2
) => {
  const radius = circleSize.width / 2;

  const dx = Math.abs(circlePosition.x - (rectanglePosition.x + rectangleSize.width / 2));
  const dy = Math.abs(circlePosition.y - (rectanglePosition.y + rectangleSize.height / 2));

  if (dx > rectangleSize.width / 2 + radius)
    return Math.max(0, rectangleSize.height / 2 - radius - dy);
  if (dy > rectangleSize.height / 2 + radius)
    return Math.max(0, rectangleSize.width / 2 - radius - dx);

  // debugger;

  // if (dx <= rectangleSize.width / 2) return 0;
  // if (dy <= rectangleSize.height / 2) return 0;

  const distance = Math.sqrt(dx * dx + dy * dy);
  return Math.max(0, radius + rectangleSize.width / 2 - distance);
};

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
    return areCirclesColliding(
      colliderA.position,
      colliderA.size,
      colliderB.position,
      colliderB.size
    );
  }
  if (
    (colliderA.shape.type === 'circle' && colliderB.shape.type === 'rectangle') ||
    (colliderA.shape.type === 'rectangle' && colliderB.shape.type === 'circle')
  ) {
    if (
      areCircleAndRectangleColliding(
        colliderA.shape.type === 'circle' ? colliderA.position : colliderB.position,
        colliderA.shape.type === 'circle' ? colliderA.size : colliderB.size,
        colliderA.shape.type === 'rectangle' ? colliderA.position : colliderB.position,
        colliderA.shape.type === 'rectangle' ? colliderA.size : colliderB.size
      )
    ) {
      return circleAndRectanglePenetrationDepth(
        colliderA.shape.type === 'circle' ? colliderA.position : colliderB.position,
        colliderA.shape.type === 'circle' ? colliderA.size : colliderB.size,
        colliderA.shape.type === 'rectangle' ? colliderA.position : colliderB.position,
        colliderA.shape.type === 'rectangle' ? colliderA.size : colliderB.size
      );
    }
  }
  if (colliderA.shape.type === 'rectangle' && colliderB.shape.type === 'rectangle') {
    return areRectanglesColliding(
      colliderA.position,
      colliderA.size,
      colliderB.position,
      colliderB.size
    );
  }
  return -1;
};

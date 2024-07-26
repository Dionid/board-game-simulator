import { SchemaType } from '../../tecs';
import { Position, Size } from '../core';
import { Collider } from './components';

export const areCirclesColliding = (
  positionA: Position,
  sizeA: Size,
  positionB: Position,
  sizeB: Size
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
  circlePosition: Position,
  circleSize: Size,
  rectanglePosition: Position,
  rectangleSize: Size
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
  circlePosition: Position,
  circleSize: Size,
  rectanglePosition: Position,
  rectangleSize: Size
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
  positionA: Position,
  sizeA: Size,
  positionB: Position,
  sizeB: Size
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
  colliderA: SchemaType<typeof Collider>,
  colliderB: SchemaType<typeof Collider>
): number => {
  if (colliderA.shape.name === 'circle' && colliderB.shape.name === 'circle') {
    return areCirclesColliding(
      colliderA.position,
      colliderA.size,
      colliderB.position,
      colliderB.size
    );
  }

  if (
    (colliderA.shape.name === 'circle' && colliderB.shape.name === 'rectangle') ||
    (colliderA.shape.name === 'rectangle' && colliderB.shape.name === 'circle')
  ) {
    if (
      areCircleAndRectangleColliding(
        colliderA.shape.name === 'circle' ? colliderA.position : colliderB.position,
        colliderA.shape.name === 'circle' ? colliderA.size : colliderB.size,
        colliderA.shape.name === 'rectangle' ? colliderA.position : colliderB.position,
        colliderA.shape.name === 'rectangle' ? colliderA.size : colliderB.size
      )
    ) {
      return circleAndRectanglePenetrationDepth(
        colliderA.shape.name === 'circle' ? colliderA.position : colliderB.position,
        colliderA.shape.name === 'circle' ? colliderA.size : colliderB.size,
        colliderA.shape.name === 'rectangle' ? colliderA.position : colliderB.position,
        colliderA.shape.name === 'rectangle' ? colliderA.size : colliderB.size
      );
    }
  }

  if (colliderA.shape.name === 'rectangle' && colliderB.shape.name === 'rectangle') {
    return areRectanglesColliding(
      colliderA.position,
      colliderA.size,
      colliderB.position,
      colliderB.size
    );
  }

  return -1;
};

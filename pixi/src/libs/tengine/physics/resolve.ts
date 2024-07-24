import { SchemaType } from '../../tecs';
import { Collider } from '../collision';
import { Circle, Rectangle } from '../core';

export function resolveCircleCircleOverlap(circle1: Circle, circle2: Circle): void {
  const dx = circle2.position.x - circle1.position.x;
  const dy = circle2.position.y - circle1.position.y;
  let distance = Math.sqrt(dx * dx + dy * dy);
  const overlap = circle1.radius + circle2.radius - distance;

  if (distance === 0) {
    distance = 0.01;
  }

  const moveX = ((dx / distance) * overlap) / 2;
  const moveY = ((dy / distance) * overlap) / 2;

  circle1.position.x -= moveX;
  circle1.position.y -= moveY;
  circle2.position.x += moveX;
  circle2.position.y += moveY;
}

export function resolveRectangleRectangleOverlap(rect1: Rectangle, rect2: Rectangle): void {
  const dx1 = rect2.position.x + rect2.size.width - rect1.position.x;
  const dx2 = rect1.position.x + rect1.size.width - rect2.position.x;
  const dy1 = rect2.position.y + rect2.size.height - rect1.position.y;
  const dy2 = rect1.position.y + rect1.size.height - rect2.position.y;

  const mtvX = Math.min(dx1, dx2) * (dx1 < dx2 ? 1 : -1);
  const mtvY = Math.min(dy1, dy2) * (dy1 < dy2 ? 1 : -1);

  if (Math.abs(mtvX) < Math.abs(mtvY)) {
    rect1.position.x -= mtvX / 2;
    rect2.position.x += mtvX / 2;
  } else {
    rect1.position.y -= mtvY / 2;
    rect2.position.y += mtvY / 2;
  }
}

export function resolveCircleRectangleOverlap(circle: Circle, rect: Rectangle): void {
  const closestX = Math.max(rect.position.x, Math.min(circle.position.x, rect.position.x + rect.size.width));
  const closestY = Math.max(rect.position.y, Math.min(circle.position.y, rect.position.y + rect.size.height));
  const dx = circle.position.x - closestX;
  const dy = circle.position.y - closestY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const overlap = circle.radius - distance;

  if (distance === 0) {
    // Handle edge case where circle center is exactly on rectangle edge
    circle.position.x = rect.position.x + rect.size.width / 2;
    circle.position.y = rect.position.y + rect.size.height / 2;
    return;
  }

  const moveX = (dx / distance) * overlap;
  const moveY = (dy / distance) * overlap;

  circle.position.x += moveX;
  circle.position.y += moveY;
}

export const resolveOverlap = (colliderA: SchemaType<typeof Collider>, colliderB: SchemaType<typeof Collider>) => {
  if (colliderA.shape.name === 'circle' && colliderB.shape.name === 'circle') {
    return resolveCircleCircleOverlap(
      {
        position: colliderA.position,
        radius: colliderA.size.width / 2,
      },
      {
        position: colliderB.position,
        radius: colliderB.size.width / 2,
      }
    );
  }

  if (
    (colliderA.shape.name === 'circle' && colliderB.shape.name === 'rectangle') ||
    (colliderA.shape.name === 'rectangle' && colliderB.shape.name === 'circle')
  ) {
    return resolveCircleRectangleOverlap(
      colliderA.shape.name === 'circle'
        ? {
            position: colliderA.position,
            radius: colliderA.size.width / 2,
          }
        : {
            position: colliderB.position,
            radius: colliderB.size.width / 2,
          },
      colliderA.shape.name === 'rectangle' ? colliderA : colliderB
    );
  }

  if (colliderA.shape.name === 'rectangle' && colliderB.shape.name === 'rectangle') {
    return resolveRectangleRectangleOverlap(colliderA, colliderB);
  }
};

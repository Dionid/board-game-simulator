import { Position2, Size2, Vector2, Velocity2 } from '../core';

// export function resolveCircleCircleOverlap(
//   a: Circle,
//   b: Circle
// ): {
//   a: Position;
//   b: Position;
// } {
//   const dx = b.position.x - a.position.x;
//   const dy = b.position.y - a.position.y;
//   let distance = Math.sqrt(dx * dx + dy * dy);
//   const overlap = a.radius + b.radius - distance;

//   if (distance === 0) {
//     distance = 0.01;
//   }

//   const moveX = ((dx / distance) * overlap) / 2;
//   const moveY = ((dy / distance) * overlap) / 2;

//   a.position.x -= moveX;
//   a.position.y -= moveY;
//   b.position.x += moveX;
//   b.position.y += moveY;

//   return {
//     a: {
//       x: a.position.x - moveX,
//       y: a.position.y - moveY,
//     },
//     b: {
//       x: b.position.x + moveX,
//       y: b.position.y + moveY,
//     },
//   };
// }

// export function resolveRectangleRectangleOverlap(
//   a: Rectangle,
//   b: Rectangle
// ): {
//   a: Position;
//   b: Position;
// } {
//   const dx1 = b.position.x + b.size.width - a.position.x;
//   const dx2 = a.position.x + a.size.width - b.position.x;
//   const dy1 = b.position.y + b.size.height - a.position.y;
//   const dy2 = a.position.y + a.size.height - b.position.y;

//   const mtvX = Math.min(dx1, dx2) * (dx1 < dx2 ? 1 : -1);
//   const mtvY = Math.min(dy1, dy2) * (dy1 < dy2 ? 1 : -1);

//   if (Math.abs(mtvX) < Math.abs(mtvY)) {
//     // a.position.x -= mtvX / 2;
//     // b.position.x += mtvX / 2;

//     return {
//       a: {
//         x: a.position.x - mtvX / 2,
//         y: a.position.y,
//       },
//       b: {
//         x: b.position.x + mtvX / 2,
//         y: b.position.y,
//       },
//     };
//   } else {
//     return {
//       a: {
//         x: a.position.x,
//         y: a.position.y - mtvY / 2,
//       },
//       b: {
//         x: b.position.x,
//         y: b.position.y + mtvY / 2,
//       },
//     };
//   }
// }

// export function resolveCircleRectangleOverlap(
//   circle: Circle,
//   rect: Rectangle
// ): {
//   a: Position;
//   b: Position;
// } {
//   const closestX = Math.max(rect.position.x, Math.min(circle.position.x, rect.position.x + rect.size.width));
//   const closestY = Math.max(rect.position.y, Math.min(circle.position.y, rect.position.y + rect.size.height));
//   const dx = circle.position.x - closestX;
//   const dy = circle.position.y - closestY;
//   const distance = Math.sqrt(dx * dx + dy * dy);
//   const overlap = circle.radius - distance;

//   if (distance === 0) {
//     // Handle edge case where circle center is exactly on rectangle edge
//     circle.position.x = rect.position.x + rect.size.width / 2;
//     circle.position.y = rect.position.y + rect.size.height / 2;
//     return;
//   }

//   const moveX = (dx / distance) * overlap;
//   const moveY = (dy / distance) * overlap;

//   circle.position.x += moveX;
//   circle.position.y += moveY;
// }

export function resolveCircleCircleOverlap(
  circle1Position: Position2,
  circle1Radius: number,
  circle1Velocity: Velocity2,
  circle2Position: Position2,
  circle2Radius: number,
  circle2Velocity: Velocity2
): void {
  const dx = circle2Position.x - circle1Position.x;
  const dy = circle2Position.y - circle1Position.y;
  let distance = Math.sqrt(dx * dx + dy * dy);
  const overlap = circle1Radius + circle2Radius - distance;

  if (distance === 0) {
    distance = 0.01;
  }

  const angle1 = Math.atan2(circle1Velocity.y, circle1Velocity.x);
  const angle2 = Math.atan2(circle2Velocity.y, circle2Velocity.x);

  const moveX1 = (Math.cos(angle1) * overlap) / 2;
  const moveY1 = (Math.sin(angle1) * overlap) / 2;
  const moveX2 = (Math.cos(angle2) * overlap) / 2;
  const moveY2 = (Math.sin(angle2) * overlap) / 2;

  circle1Position.x -= moveX1;
  circle1Position.y -= moveY1;
  circle2Position.x += moveX2;
  circle2Position.y += moveY2;
}

function resolveCircleRectangleOverlap(
  circlePosition: Position2,
  circleRadius: number,
  circleVelocity: Velocity2,

  rectanglePosition: Position2,
  rectangleSize: Size2,
  rectangleVelocity: Velocity2
): void {
  const closestX = Math.max(
    rectanglePosition.x,
    Math.min(circlePosition.x, rectanglePosition.x + rectangleSize.width)
  );
  const closestY = Math.max(
    rectanglePosition.y,
    Math.min(circlePosition.y, rectanglePosition.y + rectangleSize.height)
  );
  const distanceX = circlePosition.x - closestX;
  const distanceY = circlePosition.y - closestY;
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  const overlap = circleRadius - distance;

  // Normalized direction vector from the rectangle to the circle
  const direction = {
    x: distanceX / distance,
    y: distanceY / distance,
  };

  console.log('circlePosition', circlePosition);

  // Move the circle out of the rectangle by adjusting its position
  if (circleVelocity.x !== 0 || circleVelocity.y !== 0) {
    circlePosition.x += direction.x * overlap;
    circlePosition.y += direction.y * overlap;
  }

  console.log('after circlePosition', circlePosition);

  // Move the rectangle out of the circle by adjusting its position
  if (rectangleVelocity.x !== 0 || rectangleVelocity.y !== 0) {
    rectanglePosition.x -= direction.x * overlap;
    rectanglePosition.y -= direction.y * overlap;
  }
}

// export function resolveCircleRectangleOverlap(
//   circlePosition: Position,
//   circleRadius: number,
//   circleVelocity: Velocity,

//   rectanglePosition: Position,
//   rectangleSize: Size,
//   rectangleVelocity: Velocity
// ): void {
//   const closestX = Math.max(rectanglePosition.x, Math.min(circlePosition.x, rectanglePosition.x + rectangleSize.width));
//   const closestY = Math.max(
//     rectanglePosition.y,
//     Math.min(circlePosition.y, rectanglePosition.y + rectangleSize.height)
//   );
//   const dx = circlePosition.x - closestX;
//   const dy = circlePosition.y - closestY;
//   const distance = Math.sqrt(dx * dx + dy * dy);
//   const overlap = circleRadius - distance;

//   if (distance === 0) {
//     // Handle edge case where circle center is exactly on rectangle edge
//     const moveX = (circleVelocity.x - rectangleVelocity.x) * 0.5;
//     const moveY = (circleVelocity.y - rectangleVelocity.y) * 0.5;

//     // if (circleVelocity.x !== 0 || circleVelocity.y !== 0) {
//     circlePosition.x += moveX;
//     circlePosition.y += moveY;
//     // }

//     // if (rectangleVelocity.x !== 0 || rectangleVelocity.y !== 0) {
//     rectanglePosition.x -= moveX;
//     rectanglePosition.y -= moveY;
//     // }

//     return;
//   }

//   const angleCircle = Math.atan2(circleVelocity.y, circleVelocity.x);
//   const angleRect = Math.atan2(rectangleVelocity.y, rectangleVelocity.x);

//   const moveXCircle = (Math.cos(angleCircle) * overlap) / 2;
//   const moveYCircle = (Math.sin(angleCircle) * overlap) / 2;

//   const moveXRect = (Math.cos(angleRect) * overlap) / 2;
//   const moveYRect = (Math.sin(angleRect) * overlap) / 2;

//   // if (circleVelocity.x !== 0 || circleVelocity.y !== 0) {
//   circlePosition.x += moveXCircle;
//   circlePosition.y += moveYCircle;
//   // }

//   // if (rectangleVelocity.x !== 0 || rectangleVelocity.y !== 0) {
//   rectanglePosition.x -= moveXRect;
//   rectanglePosition.y -= moveYRect;
//   // }
// }

function resolveCircleRectangleCollision(
  penetrationDepth: number,

  circlePosition: Position2,
  circleVelocity: Velocity2,

  rectanglePosition: Position2,
  rectangleSize: Size2,
  rectangleVelocity: Velocity2
): void {
  if (penetrationDepth === 0) {
    return;
  }

  const normalX =
    (circlePosition.x - (rectanglePosition.x + rectangleSize.width / 2)) / penetrationDepth;
  const normalY =
    (circlePosition.y - (rectanglePosition.y + rectangleSize.height / 2)) / penetrationDepth;

  const dotProductCircleRect = normalX * circleVelocity.x + normalY * circleVelocity.y;
  const dotProductRectCircle = normalX * rectangleVelocity.x + normalY * rectangleVelocity.y;

  const projectionCircleRect = dotProductCircleRect * (normalX * normalX + normalY * normalY);
  const projectionRectCircle = dotProductRectCircle * (normalX * normalX + normalY * normalY);

  // debugger;

  circlePosition.x -= projectionCircleRect * normalX;
  circlePosition.y -= projectionCircleRect * normalY;

  rectanglePosition.x += projectionRectCircle * normalX;
  rectanglePosition.y += projectionRectCircle * normalY;
}

export const resolveKinematicAndStaticOverlap = (
  depth: number,

  aShape: string,
  aPosition: Position2,
  aSize: Size2,
  aVelocity: Velocity2,

  bShape: string,
  bPosition: Position2,
  bSize: Size2,
  bVelocity: Velocity2
) => {
  if (aShape === 'circle' && bShape === 'rectangle') {
    return resolveCircleRectangleCollision(
      depth,
      aPosition,
      aVelocity,
      bPosition,
      bSize,
      bVelocity
    );
  }

  if (aShape === 'rectangle' && bShape === 'circle') {
    return resolveCircleRectangleCollision(
      depth,
      bPosition,
      bVelocity,
      aPosition,
      aSize,
      aVelocity
    );
  }
};

export const resolveOverlap = (
  separation: number,
  slop: number,
  slopDampen: number,
  positionDampen: number,
  normal: Vector2,

  aShape: string,
  aIsStatic: boolean,
  aPositionImpulse: Vector2,

  bShape: string,
  bIsStatic: boolean,
  bPositionImpulse: Vector2
) => {
  if (aShape === 'circle' && bShape === 'circle') {
    let positionImpulse = separation - slop * slopDampen;

    if (aIsStatic || bIsStatic) {
      positionImpulse *= 2;
    }

    if (!aIsStatic) {
      const contactShare = positionDampen / 2;
      aPositionImpulse.x += normal.x * positionImpulse * contactShare;
      aPositionImpulse.y += normal.y * positionImpulse * contactShare;
    }

    if (!bIsStatic) {
      const contactShare = positionDampen / 2;
      bPositionImpulse.x -= normal.x * positionImpulse * contactShare;
      bPositionImpulse.y -= normal.y * positionImpulse * contactShare;
    }
  }

  // if (aShape === 'circle' && bShape === 'circle') {
  //   let positionImpulse = separation - pair.slop * slopDampen;

  //   if (bodyA.isStatic || bodyB.isStatic) {
  //     positionImpulse *= 2
  //   };

  //   if (!(bodyA.isStatic || bodyA.isSleeping)) {
  //     contactShare = positionDampen / bodyA.totalContacts;
  //     bodyA.positionImpulse.x +=
  //       normal.x * positionImpulse * contactShare;
  //     bodyA.positionImpulse.y +=
  //       normal.y * positionImpulse * contactShare;
  //   }

  //   if (!(bodyB.isStatic || bodyB.isSleeping)) {
  //     contactShare = positionDampen / bodyB.totalContacts;
  //     bodyB.positionImpulse.x -=
  //       normal.x * positionImpulse * contactShare;
  //     bodyB.positionImpulse.y -=
  //       normal.y * positionImpulse * contactShare;
  //   }
  // }

  // if (aShape === 'circle' && bShape === 'circle') {
  //   return resolveCircleCircleOverlap(aPosition, aSize.width / 2, aVelocity, bPosition, bSize.width / 2, bVelocity);
  // }
  // if ((aShape === 'circle' && bShape === 'rectangle') || (aShape === 'rectangle' && bShape === 'circle')) {
  //   return resolveCircleRectangleOverlap(
  //     aShape === 'circle' ? aPosition : bPosition,
  //     aShape === 'circle' ? aSize.width / 2 : bSize.width / 2,
  //     aShape === 'circle' ? aVelocity : bVelocity,
  //     aShape === 'rectangle' ? aPosition : bPosition,
  //     aShape === 'rectangle' ? aSize : bSize,
  //     aShape === 'rectangle' ? aVelocity : bVelocity
  //   );
  // }
  // if (aShape === 'rectangle' && bShape === 'rectangle') {
  //   return resolveRectangleRectangleOverlap(colliderA, colliderB);
  // }
};

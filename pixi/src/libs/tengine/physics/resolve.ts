import { Position2, Size2, Vector2, Velocity2 } from '../core';

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
};

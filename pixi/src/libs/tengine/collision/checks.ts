import { dotV2, multV2, Position2, subV2, unitV2 } from '../core';

export function circlesCollision(
  positionA: Position2,
  radiusA: number,
  positionB: Position2,
  radiusB: number
) {
  const dx = positionA.x - positionB.x;
  const dy = positionA.y - positionB.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = radiusA + radiusB;

  return {
    overlap: minDistance - distance,
    axis: unitV2({ x: dx, y: dy }),
  };
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

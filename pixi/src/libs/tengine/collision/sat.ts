import { Axes2, Vector2, Vertices2 } from '../core';

export type SATShape = {
  vertices: Vector2[];
  axes: Vector2[];
};

export function overlapAxes(
  verticesA: Vector2[],
  verticesB: Vector2[],
  axes: Vector2[]
): {
  overlap: number;
  axis: Vector2;
} {
  if (verticesA.length === 0 || verticesB.length === 0) {
    return {
      overlap: 0,
      axis: { x: 0, y: 0 },
    };
  }

  const verticesAX = verticesA[0].x;
  const verticesAY = verticesA[0].y;

  const verticesBX = verticesB[0].x;
  const verticesBY = verticesB[0].y;

  let overlapMin: number = Number.MAX_VALUE;
  let overlapAxis: Vector2 = axes[0];

  for (let i = 0; i < axes.length; i++) {
    const axis = axes[i];

    const axisX = axis.x;
    const axisY = axis.y;

    let minA = verticesAX * axisX + verticesAY * axisY;
    let maxA = minA;

    let minB = verticesBX * axisX + verticesBY * axisY;
    let maxB = minB;

    for (let j = 1; j < verticesA.length; j += 1) {
      const dot = verticesA[j].x * axisX + verticesA[j].y * axisY;

      if (dot > maxA) {
        maxA = dot;
      } else if (dot < minA) {
        minA = dot;
      }
    }

    for (let j = 1; j < verticesB.length; j += 1) {
      const dot = verticesB[j].x * axisX + verticesB[j].y * axisY;

      if (dot > maxB) {
        maxB = dot;
      } else if (dot < minB) {
        minB = dot;
      }
    }

    const overlapAB = maxA - minB;
    const overlapBA = maxB - minA;
    const overlap = overlapAB < overlapBA ? overlapAB : overlapBA;

    if (overlap < overlapMin) {
      overlapMin = overlap;
      overlapAxis = axis;

      if (overlap <= 0) {
        // can not be intersecting
        break;
      }
    }
  }

  return {
    overlap: overlapMin,
    axis: overlapAxis,
  };
}

export type SATResult = {
  overlap: number;
  axis: Vector2;
};

export function sat(
  aVertices: Vertices2,
  aAxes: Axes2,
  bVertices: Vertices2,
  bAxes: Axes2
): null | {
  overlap: number;
  axis: Vector2;
} {
  const overlapAB = overlapAxes(aVertices, bVertices, aAxes);

  if (overlapAB.overlap <= 0) {
    return null;
  }

  const overlapBA = overlapAxes(bVertices, aVertices, bAxes);

  if (overlapBA.overlap <= 0) {
    return null;
  }

  const minOverlap = overlapAB.overlap < overlapBA.overlap ? overlapAB : overlapBA;

  return {
    overlap: minOverlap.overlap,
    axis: minOverlap.axis,
  };
}

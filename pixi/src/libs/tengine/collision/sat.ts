import { normalV2, subV2, unitV2, Vector2 } from '../core';

export type SATShape = {
  vertices: Vector2[];
  axes: Vector2[];
};

export function normalAxes(vertices: Vector2[]): Vector2[] {
  const axes: Vector2[] = [];

  for (let i = 0; i < vertices.length; i += 1) {
    const j = i + 1 === vertices.length ? 0 : i + 1;
    const p1 = vertices[i];
    const p2 = vertices[j];

    const edge = subV2(p1, p2);
    axes.push(normalV2(unitV2(edge)));
  }

  return axes;
}

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

export function sat(
  a: SATShape,
  b: SATShape
): null | {
  overlap: number;
  axis: Vector2;
} {
  const overlapAB = overlapAxes(a.vertices, b.vertices, a.axes);

  if (overlapAB.overlap <= 0) {
    return null;
  }

  const overlapBA = overlapAxes(b.vertices, a.vertices, b.axes);

  if (overlapBA.overlap <= 0) {
    return null;
  }

  const minOverlap = overlapAB.overlap < overlapBA.overlap ? overlapAB : overlapBA;

  return {
    overlap: minOverlap.overlap,
    axis: minOverlap.axis,
  };
}

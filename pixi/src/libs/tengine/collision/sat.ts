import { Component } from 'libs/tecs';
import { addV2, Axes2, magV2, multV2, Position2, subV2, unitV2, Vector2, Vertices2 } from '../core';
import { Collider } from './components';

export type SATShape = {
  vertices: Vector2[];
  axes: Vector2[];
};

export function getCircleAxesAndVertices(
  circleCenter: Position2,
  radius: number,
  colliderB: Component<typeof Collider>
) {
  if (colliderB._vertices.length === 0) {
    return {
      axes: [],
      vertices: [],
    };
  }

  // # Find rectangle closest vertex
  let closesVertex = colliderB._vertices[0];
  let closestDistance = magV2(subV2(circleCenter, closesVertex));

  for (let i = 1; i < colliderB._vertices.length; i++) {
    const vertex = colliderB._vertices[i];
    const vertexDistance = magV2(subV2(circleCenter, vertex));
    if (vertexDistance < closestDistance) {
      closesVertex = vertex;
      closestDistance = vertexDistance;
    }
  }

  // # Use unit vector of closest point as circle axes
  const circleAxis = unitV2(subV2(closesVertex, circleCenter));

  // # Circle Vertices based on circle and rectangle axes
  const circleVertices: Vertices2 = [
    addV2(circleCenter, multV2(circleAxis, -radius)),
    addV2(circleCenter, multV2(circleAxis, radius)),
  ];

  for (let i = 0; i < colliderB._normalAxes.length; i++) {
    const axis = colliderB._normalAxes[i];
    const vertex1 = addV2(circleCenter, multV2(axis, -radius));
    const vertex2 = addV2(circleCenter, multV2(axis, radius));
    circleVertices.push(vertex1);
    circleVertices.push(vertex2);
  }

  return {
    axes: [circleAxis],
    vertices: circleVertices,
  };
}

export function overlapAxes(
  verticesA: Vector2[],
  verticesB: Vector2[],
  axes: Vector2[]
): {
  overlap: number;
  axis: Vector2;
} {
  if (axes.length === 0 || verticesA.length === 0 || verticesB.length === 0) {
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
  let aOverlapMin = 0;
  let aOverlapMax = 0;
  let bOverlapMin = 0;
  let bOverlapMax = 0;

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

      aOverlapMin = minA;
      aOverlapMax = maxA;
      bOverlapMin = minB;
      bOverlapMax = maxB;

      if (overlap <= 0) {
        // can not be intersecting
        break;
      }
    }
  }

  // # Check for containment
  if (
    (aOverlapMax > bOverlapMax && aOverlapMin < bOverlapMin) ||
    (bOverlapMax > aOverlapMax && bOverlapMin < aOverlapMin)
  ) {
    const mins = Math.abs(aOverlapMin - bOverlapMin);
    const maxes = Math.abs(aOverlapMax - bOverlapMax);

    if (mins < maxes) {
      overlapMin += mins;
    } else {
      overlapMin += maxes;
      overlapAxis.x = -overlapAxis.x;
      overlapAxis.y = -overlapAxis.y;
    }
  }

  // # Reverse axis
  if (aOverlapMax > bOverlapMax) {
    overlapAxis.x = -overlapAxis.x;
    overlapAxis.y = -overlapAxis.y;
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
): null | SATResult {
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

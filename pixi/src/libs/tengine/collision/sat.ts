import { Component } from 'libs/tecs';
import {
  addV2,
  Axes2,
  dotV2,
  magV2,
  multV2,
  Position2,
  subV2,
  unitV2,
  Vector2,
  Vertices2,
} from '../core';
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

  // # Direction from circle center to closest vertex
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

    let aMin = verticesAX * axis.x + verticesAY * axis.y;
    let aMax = aMin;
    let bMin = verticesBX * axis.x + verticesBY * axis.y;
    let bMax = bMin;

    for (let j = 1; j < verticesA.length; j += 1) {
      const dot = dotV2(verticesA[j], axis);

      if (dot > aMax) {
        aMax = dot;
      } else if (dot < aMin) {
        aMin = dot;
      }
    }

    for (let j = 1; j < verticesB.length; j += 1) {
      const dot = dotV2(verticesB[j], axis);

      if (dot > bMax) {
        bMax = dot;
      } else if (dot < bMin) {
        bMin = dot;
      }
    }

    const overlapAB = aMax - bMin;
    const overlapBA = bMax - aMin;
    const overlap = overlapAB < overlapBA ? overlapAB : overlapBA;

    if (overlap < overlapMin) {
      overlapMin = overlap;
      overlapAxis = axis;

      aOverlapMin = aMin;
      aOverlapMax = aMax;
      bOverlapMin = bMin;
      bOverlapMax = bMax;

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
    }
  }

  // # Reverse axis
  // if (aOverlapMax > bOverlapMax) {
  //   overlapAxis.x *= -1;
  //   overlapAxis.y *= -1;
  // }

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

  // QUESTION: maybe incorrect, than need to use center position
  // # Ensure minOverlap is pointing from A to B
  const centerAToCenterB = subV2(bVertices[0], aVertices[0]);
  const dot = dotV2(centerAToCenterB, minOverlap.axis);

  if (dot > 0) {
    minOverlap.axis.x *= -1;
    minOverlap.axis.y *= -1;
  }

  return {
    overlap: minOverlap.overlap,
    axis: minOverlap.axis,
  };
}

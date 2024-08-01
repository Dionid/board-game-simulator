import { Component } from 'libs/tecs';
import { circlesCollision } from './checks';
import { Collider } from './components';
import { safeGuard } from 'libs/tecs/switch';
import { getCircleAxesAndVertices, sat } from './sat';
import { Axis2 } from '../core';

export type CollisionResult = {
  overlap: number;
  axis: Axis2;
};

export function collision(
  colliderA: Component<typeof Collider>,
  colliderB: Component<typeof Collider>
): CollisionResult | null {
  switch (colliderA.shape.type) {
    case 'circle': {
      switch (colliderB.shape.type) {
        case 'circle': {
          return circlesCollision(
            colliderA._position,
            colliderA.shape.radius,
            colliderB._position,
            colliderB.shape.radius
          );
        }
        case 'rectangle': {
          const { axes: circleAxes, vertices: circleVertices } = getCircleAxesAndVertices(
            colliderA._origin,
            colliderA.shape.radius,
            colliderB
          );

          return sat(circleVertices, circleAxes, colliderB._vertices, colliderB._normalAxes);
        }
        case 'line': {
          return null;
        }
        default: {
          return safeGuard(colliderB.shape);
        }
      }
    }
    case 'rectangle': {
      switch (colliderB.shape.type) {
        case 'circle': {
          const { axes: circleAxes, vertices: circleVertices } = getCircleAxesAndVertices(
            colliderB._origin,
            colliderB.shape.radius,
            colliderA
          );

          return sat(colliderA._vertices, colliderA._normalAxes, circleVertices, circleAxes);
        }
        case 'rectangle': {
          return sat(
            colliderA._vertices,
            colliderA._normalAxes,
            colliderB._vertices,
            colliderB._normalAxes
          );
        }
        case 'line': {
          return null;
        }
        default: {
          return safeGuard(colliderB.shape);
        }
      }
    }
    case 'line': {
      return null;
    }
    default: {
      return safeGuard(colliderA.shape);
    }
  }
}

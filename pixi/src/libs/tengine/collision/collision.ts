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
        case 'vertices': {
          const { axes: circleAxes, vertices: circleVertices } = getCircleAxesAndVertices(
            colliderA._origin,
            colliderA.shape.radius,
            colliderB
          );

          return sat(
            colliderA._position,
            circleVertices,
            circleAxes,
            colliderB._position,
            colliderB._vertices,
            colliderB._normalAxes
          );
        }
        default: {
          return safeGuard(colliderB.shape);
        }
      }
    }
    case 'vertices': {
      switch (colliderB.shape.type) {
        case 'circle': {
          const { axes: circleAxes, vertices: circleVertices } = getCircleAxesAndVertices(
            colliderB._origin,
            colliderB.shape.radius,
            colliderA
          );

          return sat(
            colliderA._position,
            colliderA._vertices,
            colliderA._normalAxes,
            colliderB._position,
            circleVertices,
            circleAxes
          );
        }
        case 'vertices':
          return sat(
            colliderA._position,
            colliderA._vertices,
            colliderA._normalAxes,
            colliderB._position,
            colliderB._vertices,
            colliderB._normalAxes
          );
        default: {
          return safeGuard(colliderB.shape);
        }
      }
    }
    default: {
      return safeGuard(colliderA.shape);
    }
  }
}

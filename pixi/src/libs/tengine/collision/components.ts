import { newSchema, arrayOf, union, literal, number, newTag, Component } from '../../tecs';
import {
  Axes2,
  mutRotateVertices2Around,
  normalAxes2,
  normalV2,
  subV2,
  unitV2,
  Vector2,
  Vertices2,
} from '../core';

// # Check this object for collisions with any other Colliders
export const CollisionsMonitoring = newTag();

// # Forbid penetration of solid Colliders
export const Impenetrable = newTag();

// # Collider

export const ColliderCircle = newSchema({
  type: literal('circle'),
  radius: number,
  anchor: Vector2,
});

export const ColliderRectangle = newSchema({
  type: literal('rectangle'),
  width: number,
  height: number,
  anchor: Vector2,
});

export const ColliderLine = newSchema({
  type: literal('line'),
  length: number,
  anchor: number,
});

export const ColliderShape = union(ColliderRectangle, ColliderCircle, ColliderLine);

export const Collider = newSchema({
  type: union(literal('solid'), literal('sensor')),
  offset: Vector2,
  angle: number,
  shape: ColliderShape,
  mass: number,
  _position: Vector2,
  _origin: Vector2,
  _vertices: Vertices2,
  _normalAxes: Axes2,
  _prev: newSchema({
    angle: number,
    offset: Vector2,
  }),
});

export function rectangleColliderComponent(opts: {
  parentPosition: Vector2; // TODO: remove this
  parentAngle: number; // TODO: remove this
  type: 'solid' | 'sensor';
  mass: number;
  offset: Vector2;
  angle: number;
  anchor: Vector2;
  size: { width: number; height: number };
}): Component<typeof Collider> {
  const origin = {
    x: opts.parentPosition.x + opts.offset.x,
    y: opts.parentPosition.y + opts.offset.y,
  };
  const colliderPosition = {
    x: origin.x - opts.size.width * opts.anchor.x,
    y: origin.y - opts.size.height * opts.anchor.y,
  };
  const colliderVertices = [
    {
      x: colliderPosition.x,
      y: colliderPosition.y,
    },
    {
      x: colliderPosition.x + opts.size.width,
      y: colliderPosition.y,
    },
    {
      x: colliderPosition.x + opts.size.width,
      y: colliderPosition.y + opts.size.height,
    },
    {
      x: colliderPosition.x,
      y: colliderPosition.y + opts.size.height,
    },
  ];

  mutRotateVertices2Around(colliderVertices, opts.angle, origin);
  mutRotateVertices2Around(colliderVertices, opts.parentAngle, opts.parentPosition);

  // # Rectangle can have only 2 normal axes
  const normalAxes = [
    normalV2(unitV2(subV2(colliderVertices[1], colliderVertices[0]))),
    normalV2(unitV2(subV2(colliderVertices[2], colliderVertices[1]))),
  ];

  return {
    type: opts.type,
    mass: opts.mass,
    offset: opts.offset,
    angle: opts.angle,
    shape: {
      type: 'rectangle' as const,
      anchor: opts.anchor,
      width: opts.size.width,
      height: opts.size.height,
    },
    _position: colliderPosition,
    _origin: origin,
    _vertices: colliderVertices,
    _normalAxes: normalAxes,
    _prev: {
      angle: opts.angle,
      offset: {
        x: opts.offset.x,
        y: opts.offset.y,
      },
    },
  };
}

export function circleColliderComponent(opts: {
  parentPosition: Vector2; // TODO: remove this
  parentAngle: number; // TODO: remove this
  type: 'solid' | 'sensor';
  mass: number;
  offset: Vector2;
  angle: number;
  anchor: Vector2;
  radius: number;
}): Component<typeof Collider> {
  const origin = {
    x: opts.parentPosition.x + opts.offset.x,
    y: opts.parentPosition.y + opts.offset.y,
  };
  const colliderPosition = {
    x: origin.x - opts.radius + 2 * opts.radius * opts.anchor.x,
    y: origin.y - opts.radius + 2 * opts.radius * opts.anchor.y,
  };
  const colliderVertices: Axes2 = [];

  const normalAxes = normalAxes2(colliderVertices);

  return {
    type: opts.type,
    mass: opts.mass,
    offset: opts.offset,
    angle: opts.angle,
    shape: {
      type: 'circle' as const,
      anchor: opts.anchor,
      radius: opts.radius,
    },
    _position: colliderPosition,
    _origin: origin,
    _vertices: colliderVertices,
    _normalAxes: normalAxes,
    _prev: {
      angle: opts.angle,
      offset: {
        x: opts.offset.x,
        y: opts.offset.y,
      },
    },
  };
}

export const ColliderSet = newSchema({
  list: arrayOf(Collider),
});

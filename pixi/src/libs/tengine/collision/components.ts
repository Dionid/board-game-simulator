import { newSchema, arrayOf, union, literal, number, newTag, Component } from '../../tecs';
import { Axes2, mutRotateVertices2Around, normalAxes2, Vector2, Vertices2 } from '../core';

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

export function rectangleColliderComponent(
  parentPosition: Vector2, // TODO: remove this
  parentAngle: number, // TODO: remove this
  type: 'solid' | 'sensor',
  mass: number,
  offset: Vector2,
  angle: number,
  anchor: Vector2,
  size: { width: number; height: number }
): Component<typeof Collider> {
  const origin = {
    x: parentPosition.x + offset.x,
    y: parentPosition.y + offset.y,
  };
  const colliderPosition = {
    x: origin.x - size.width * anchor.x,
    y: origin.y - size.height * anchor.y,
  };
  const colliderVertices = [
    {
      x: colliderPosition.x,
      y: colliderPosition.y,
    },
    {
      x: colliderPosition.x + size.width,
      y: colliderPosition.y,
    },
    {
      x: colliderPosition.x + size.width,
      y: colliderPosition.y + size.height,
    },
    {
      x: colliderPosition.x,
      y: colliderPosition.y + size.height,
    },
  ];

  mutRotateVertices2Around(colliderVertices, angle, origin);
  mutRotateVertices2Around(colliderVertices, parentAngle, parentPosition);

  const normalAxes = normalAxes2(colliderVertices);

  return {
    type,
    mass,
    offset,
    angle,
    shape: {
      type: 'rectangle' as const,
      anchor: anchor,
      width: size.width,
      height: size.height,
    },
    _position: colliderPosition,
    _origin: origin,
    _vertices: colliderVertices,
    _normalAxes: normalAxes,
    _prev: {
      angle: angle,
      offset: {
        x: offset.x,
        y: offset.y,
      },
    },
  };
}

export const ColliderSet = newSchema({
  list: arrayOf(Collider),
});

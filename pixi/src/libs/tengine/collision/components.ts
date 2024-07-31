import { newSchema, arrayOf, union, literal, number, newTag } from '../../tecs';
import { Vector2 } from '../core';
import { Position2 } from '../core/types';

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
  _position: Vector2,
  rotation: number,
  shape: ColliderShape,
  mass: number,
});

export const ColliderSet = newSchema({
  list: arrayOf(Collider),
});

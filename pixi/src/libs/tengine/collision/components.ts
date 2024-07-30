import { newSchema, arrayOf, union, literal, number, newTag } from '../../tecs';
import { Position2 } from '../core/types';

// # Check this object for collisions with any other Colliders
export const CollisionsMonitoring = newTag();

// # Forbid penetration of solid Colliders
export const Impenetrable = newTag();

// # Collider

export const ColliderRectangle = newSchema({
  type: literal('constant_rectangle'),
  width: number,
  height: number,
});

export const ColliderCircle = newSchema({
  type: literal('circle'),
  radius: number,
});

export const ColliderLine = newSchema({
  type: literal('line'),
  length: number,
});

export const ColliderShape = union(ColliderRectangle, ColliderCircle, ColliderLine);

export const Collider = newSchema({
  type: union(literal('solid'), literal('sensor')),
  offset: Position2,
  position: Position2,
  shape: ColliderShape,
  mass: number,
});

export const ColliderSet = newSchema({
  list: arrayOf(Collider),
});

import { newSchema, arrayOf, union, literal, number, newTag } from '../../tecs';
import { Position2 } from '../core/types';

// # Check this object for collisions with any other Colliders
export const CollisionsMonitoring = newTag();

// # Forbid penetration of solid Colliders
export const Impenetrable = newTag();

export const Immovable = newTag();

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

export const ColliderShape = union(ColliderRectangle, ColliderCircle);

export const Collider = newSchema({
  type: union(literal('solid'), literal('sensor')),
  offset: Position2,
  position: Position2, // QUESTION: maybe remove
  shape: ColliderShape,
});

export const ColliderSet = newSchema({
  list: arrayOf(Collider),
});

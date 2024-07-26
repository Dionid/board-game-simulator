import { newSchema, arrayOf, Tag, union, newLiteral, number } from '../../tecs';
import { Position2 } from '../physics/components';

export const ActiveCollisions = Tag.new();

export const ColliderRectangle = newSchema({
  type: newLiteral('rectangle'),
  width: number,
  height: number,
});

export const ColliderCircle = newSchema({
  type: newLiteral('circle'),
  radius: number,
});

export const ColliderShape = union(ColliderRectangle, ColliderCircle);

export const Collider = newSchema({
  type: union(newLiteral('solid'), newLiteral('sensor')),
  offset: Position2,
  position: Position2,
  shape: ColliderShape,
});

export const ColliderSet = newSchema({
  list: arrayOf(Collider),
});

import { newSchema, arrayOf, Tag, union, newLiteral } from '../../tecs';
import { Position2 } from '../core/components';

export const ActiveCollisions = Tag.new();

export const Collider = newSchema({
  type: union(newLiteral('solid'), newLiteral('sensor')),
  offset: Position2,
});

export const ColliderSet = newSchema({
  list: arrayOf(Collider),
});

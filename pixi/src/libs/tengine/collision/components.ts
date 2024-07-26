import { newSchema, arrayOf, Tag, union, newLiteral, number } from '../../tecs';
import { Position2 } from '../core/components';

export const ActiveCollisions = Tag.new();

export const ColliderShape = union(
  newSchema({
    type: newLiteral('rectangle'),
    width: number,
    height: number,
  }),
  newSchema({
    type: newLiteral('circle'),
    radius: number,
  })
);

export const Collider = newSchema({
  type: union(newLiteral('solid'), newLiteral('sensor')),
  offset: Position2,
  shape: ColliderShape,
});

export const ColliderSet = newSchema({
  list: arrayOf(Collider),
});

import { newSchema, arrayOf, Tag, string, union, newLiteral } from '../../tecs';
import { Position2 } from '../core/components';

export const ActiveCollisions = Tag.new();

// // QUESTION: must be part of Collider, but how to do it?
// export const ColliderSolid = Tag.new();
// export const ColliderSensor = Tag.new();

// const colliderType = union(string, 'solid', 'sensor');

const solid = newLiteral('solid');
const sensor = newLiteral('sensor');

const colliderType = union(string, 'solid', 'sensor');

export const Collider = newSchema({
  type: colliderType,
  offset: Position2,
});

export const ColliderSet = newSchema({
  list: arrayOf(Collider),
});

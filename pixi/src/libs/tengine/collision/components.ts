import { newSchema, arrayOf, Tag, string } from '../../tecs';
import { Shape, Size, Position, Rotation } from '../ecs';

export const ActiveCollisions = Tag.new();

// // QUESTION: must be part of Collider, but how to do it?
// export const ColliderSolid = Tag.new();
// export const ColliderSensor = Tag.new();

export const Collider = newSchema({
  type: string, // 'solid' | 'sensor'
  shape: Shape,
  size: Size,
  position: Position, // this is relative to the entity CollisionBody
  rotation: Rotation,
});

export const ColliderSet = newSchema({
  list: arrayOf(Collider),
});

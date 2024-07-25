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
  // Position relative to the entity Position
  offset: Position,
  // QUESTION: is it needed?
  // Global position
  position: Position,
  rotation: Rotation,
});

export const ColliderSet = newSchema({
  list: arrayOf(Collider),
});

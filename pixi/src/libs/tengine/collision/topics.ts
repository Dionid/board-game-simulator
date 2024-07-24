import { Entity, SchemaType, newTopic } from '../../tecs';
import { Position } from '../core';
import { Collider, ColliderSet } from './components';

export type CollidingEvent = {
  a: {
    entity: Entity;
    colliderSet: SchemaType<typeof ColliderSet>;
    collider: SchemaType<typeof Collider>;
    newPosition: Position;
  };
  b: {
    entity: Entity;
    colliderSet: SchemaType<typeof ColliderSet>;
    collider: SchemaType<typeof Collider>;
    newPosition: Position;
  };
};

export const willCollideTopic = newTopic<CollidingEvent>();

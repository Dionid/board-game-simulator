import { Entity, SchemaType, newTopic } from '../../tecs';
import { Position } from '../core';
import { Collider, ColliderSet } from './components';

export type CollisionStartedEvent = {
  name: 'collisionStarted';
  a: {
    entity: Entity;
    colliderSet: SchemaType<typeof ColliderSet>;
    collider: SchemaType<typeof Collider>;
  };
  b: {
    entity: Entity;
    colliderSet: SchemaType<typeof ColliderSet>;
    collider: SchemaType<typeof Collider>;
  };
};

export type WillCollideEvent = {
  name: 'willCollide';
  a: {
    entity: Entity;
    colliderSet: SchemaType<typeof ColliderSet>;
    collider: SchemaType<typeof Collider>;
    collidingPosition: Position;
    overlap: number;
  };
  b: {
    entity: Entity;
    colliderSet: SchemaType<typeof ColliderSet>;
    collider: SchemaType<typeof Collider>;
    collidingPosition: Position;
    overlap: number;
  };
};

export const collideStartedTopic = newTopic<CollisionStartedEvent>();
export const willCollideTopic = newTopic<WillCollideEvent>();

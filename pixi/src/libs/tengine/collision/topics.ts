import { Entity, SchemaType, newTopic } from '../../tecs';
import { Vector2 } from '../core';
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

export type CollidingEvent = {
  name: 'colliding';
  depth: number;
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

export const collideStartedTopic = newTopic<CollisionStartedEvent>();
export const colliding = newTopic<CollidingEvent>();

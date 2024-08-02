import { Entity, KindToType, newTopic } from '../../tecs';
import { Vector2 } from '../core';
import { Collider, ColliderBody } from './components';

export type CollisionStartedEvent = {
  name: 'collisionStarted';
  a: {
    entity: Entity;
    colliderSet: KindToType<typeof ColliderBody>;
    collider: KindToType<typeof Collider>;
  };
  b: {
    entity: Entity;
    colliderSet: KindToType<typeof ColliderBody>;
    collider: KindToType<typeof Collider>;
  };
};

export type CollidingEvent = {
  name: 'colliding';
  overlap: number;
  axis: Vector2;
  a: {
    entity: Entity;
    colliderSet: KindToType<typeof ColliderBody>;
    collider: KindToType<typeof Collider>;
  };
  b: {
    entity: Entity;
    colliderSet: KindToType<typeof ColliderBody>;
    collider: KindToType<typeof Collider>;
  };
};

export const collideStartedTopic = newTopic<CollisionStartedEvent>();
export const unfilteredColliding = newTopic<CollidingEvent>();

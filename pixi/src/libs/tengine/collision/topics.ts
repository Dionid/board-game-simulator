import { Entity, KindToType, newTopic } from '../../tecs';
import { Vector2 } from '../core';
import { Collider, ColliderBody } from './components';

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

// # Unfiltered colliding events
export const unfilteredColliding = newTopic<CollidingEvent>();

// # Deduped colliding events
export const colliding = newTopic<CollidingEvent>();

// # Collision started events
export const collideStartedTopic = newTopic<CollidingEvent>();

// # Collision ended events
export const collideEndedTopic = newTopic<CollidingEvent>();

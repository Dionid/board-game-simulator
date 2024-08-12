import { componentByEntity, registerTopic, System } from 'libs/tecs';
import { Game } from '../game';
import { Mass, Position2 } from '../core';
import { CollidingEvent, immediateColliding } from './topics';
import { ColliderBody, Impenetrable } from './components';
import { resolvePenetration } from './resolvers';

export const penetrationResolution = (game: Game): System => {
  const topic = registerTopic(game.essence, immediateColliding);

  return () => {
    const minOverlapCollisionEvents: Record<string, CollidingEvent> = {};

    for (const event of topic) {
      const { a, b, overlap } = event;

      // # We only resolve penetration between solid objects
      if (a.collider.type !== 'solid' && b.collider.type !== 'solid') {
        continue;
      }

      const index = [a, b]
        .sort((a, b) => {
          return a.entity - b.entity;
        })
        .join('-');

      const existingEvent = minOverlapCollisionEvents[index];

      if (existingEvent && existingEvent.overlap < overlap) {
        continue;
      }

      minOverlapCollisionEvents[index] = event;
    }

    for (const eventInd in minOverlapCollisionEvents) {
      const event = minOverlapCollisionEvents[eventInd];

      const { a, b, overlap, axis } = event;

      const aImpenetrable = componentByEntity(game.essence, a.entity, Impenetrable);
      const bImpenetrable = componentByEntity(game.essence, b.entity, Impenetrable);

      // # We don't resolve penetration if both objects are not impenetrable
      if (!aImpenetrable && !bImpenetrable) {
        continue;
      }

      const aPosition = componentByEntity(game.essence, a.entity, Position2);
      const bPosition = componentByEntity(game.essence, b.entity, Position2);

      if (!aPosition || !bPosition) {
        continue;
      }

      const aColliderSet = componentByEntity(game.essence, a.entity, ColliderBody);
      const bColliderSet = componentByEntity(game.essence, b.entity, ColliderBody);

      if (!aColliderSet || !bColliderSet) {
        continue;
      }

      const aTotalMass = componentByEntity(game.essence, a.entity, Mass);
      const bTotalMass = componentByEntity(game.essence, b.entity, Mass);

      if (!aTotalMass || !bTotalMass) {
        continue;
      }

      resolvePenetration(
        axis,
        overlap,
        a.colliderSet,
        aPosition,
        aTotalMass.value,
        b.colliderSet,
        bPosition,
        bTotalMass.value
      );

      continue;
    }
  };
};

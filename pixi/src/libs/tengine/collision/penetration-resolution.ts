import { componentByEntity, registerTopic, System } from 'libs/tecs';
import { Game } from '../game';
import { Position2 } from '../core';
import { colliding } from './topics';
import { ColliderBody, Impenetrable } from './components';
import { resolvePenetration } from './resolvers';

export const penetrationResolution = (game: Game): System => {
  const topic = registerTopic(game.essence, colliding);

  return () => {
    for (const event of topic) {
      const { a, b, overlap, axis } = event;

      // # We only resolve penetration between solid objects
      if (a.collider.type !== 'solid' && b.collider.type !== 'solid') {
        continue;
      }

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

      resolvePenetration(axis, overlap, a.colliderSet, aPosition, b.colliderSet, bPosition);

      continue;
    }
  };
};

import { componentByEntity, registerTopic, System, Topic } from '../../tecs';
import { Game } from '../game';
import { Awaken } from './components';
import {
  collisionEndedTopic,
  collisionStartedTopic,
  immediateColliding,
  CollidingEvent,
  immediateUnfilteredColliding,
  colliding,
} from './topics';

export type CollidingPairsIndex = Record<string, CollidingEvent>;

export const filterCollisionEvents = (game: Game): System => {
  const unfilteredCollidingT = registerTopic(game.essence, immediateUnfilteredColliding);
  const internalCollidingT = registerTopic(game.essence, immediateColliding);
  const collidingT = registerTopic(game.essence, colliding);
  const collideStartedTopicT = registerTopic(game.essence, collisionStartedTopic);
  const collideEndedTopicT = registerTopic(game.essence, collisionEndedTopic);

  const pairs: CollidingPairsIndex = {};

  return () => {
    const temp: CollidingPairsIndex = {};

    for (const event of unfilteredCollidingT) {
      const { a, b } = event;

      const index = [a, b]
        .sort((a, b) => {
          return a.entity - b.entity;
        })
        .map((ent) => {
          return `${ent.entity}-${ent.colliderId}`;
        })
        .join('-');

      if (temp[index]) {
        continue;
      }

      // # Emit deduped colliding events
      Topic.emit(internalCollidingT, event, true);
      Topic.emit(collidingT, event);

      temp[index] = event;
    }

    for (const index in pairs) {
      if (!temp[index]) {
        const { a, b } = pairs[index];

        const aIsAwaken = componentByEntity(game.essence, a.entity, Awaken);
        const bIsAwaken = componentByEntity(game.essence, b.entity, Awaken);

        if (aIsAwaken || bIsAwaken) {
          Topic.emit(collideEndedTopicT, pairs[index]);
          delete pairs[index];
        }
      }
    }

    for (const index in temp) {
      const event = temp[index];

      // # Collision started events
      if (!pairs[index]) {
        Topic.emit(collideStartedTopicT, event);
      }

      pairs[index] = event;
    }
  };
};

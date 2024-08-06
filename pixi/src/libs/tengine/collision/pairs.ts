import { registerTopic, System, Topic } from '../../tecs';
import { Game } from '../game';
import {
  collisionEndedTopic,
  collisionStartedTopic,
  internalColliding,
  CollidingEvent,
  internalUnfilteredColliding,
  colliding,
} from './topics';

export type CollidingPairsIndex = Record<string, CollidingEvent>;

export const filterCollisionEvents = (game: Game): System => {
  const unfilteredCollidingT = registerTopic(game.essence, internalUnfilteredColliding);
  const internalCollidingT = registerTopic(game.essence, internalColliding);
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
        Topic.emit(collideEndedTopicT, pairs[index]);
        delete pairs[index];
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

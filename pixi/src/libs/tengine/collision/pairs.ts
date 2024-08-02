import { registerTopic, System, Topic } from '../../tecs';
import { Game } from '../game';
import {
  collideEndedTopic,
  collideStartedTopic,
  colliding,
  CollidingEvent,
  unfilteredColliding,
} from './topics';

export type CollidingPairsIndex = Record<string, CollidingEvent>;

export const filterCollisionEvents = (game: Game): System => {
  const unfilteredCollidingT = registerTopic(game.essence, unfilteredColliding);
  const collidingT = registerTopic(game.essence, colliding);
  const collideStartedTopicT = registerTopic(game.essence, collideStartedTopic);
  const collideEndedTopicT = registerTopic(game.essence, collideEndedTopic);

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
      Topic.emit(collidingT, event, true);

      temp[index] = event;
    }

    for (const index in pairs) {
      if (!temp[index]) {
        Topic.emit(collideEndedTopicT, pairs[index], true);
        delete pairs[index];
      }
    }

    for (const index in temp) {
      const event = temp[index];

      // # Collision started events
      if (!pairs[index]) {
        Topic.emit(collideStartedTopicT, event, true);
      }

      pairs[index] = event;
    }
  };
};

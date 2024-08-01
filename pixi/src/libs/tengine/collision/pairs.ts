import { registerTopic, System } from '../../tecs';
import { Game } from '../game';
import { unfilteredColliding } from './topics';

export const resolveCollisionPairs = (game: Game): System => {
  const topic = registerTopic(game.essence, unfilteredColliding);

  return () => {
    for (const event of topic) {
      const { a, b } = event;

      // # Emit collision started event
      // QUESTION: if collision was with sensor collider, than somehow need to determine
      // is it "started", "active" or "ended" collision
      // emit(
      //   collideStartedTopic,
      //   {
      //     name: 'collisionStarted',
      //     a: {
      //       entity: a.entity,
      //       colliderSet: a.colliderSet,
      //       collider: a.collider,
      //     },
      //     b: {
      //       entity: b.entity,
      //       colliderSet: b.colliderSet,
      //       collider: b.collider,
      //     },
      //   },
      //   true
      // );
    }
  };
};

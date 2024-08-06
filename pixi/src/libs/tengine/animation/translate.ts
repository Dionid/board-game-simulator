import {
  newQuery,
  newSchema,
  number,
  registerQuery,
  removeComponent,
  System,
  table,
} from 'libs/tecs';
import { applyEaseIn, easing } from './core';
import { Game } from '../game';
import { Position2, round } from '../core';
import { safeGuard } from 'libs/tecs/switch';

export const TranslateAnimation = newSchema(
  {
    x: number,
    y: number,
    duration: number,
    easing,
    startTime: number,
  },
  {
    name: 'TranslateAnimation',
  }
);

export const translateWithAnimationQuery = newQuery(Position2, TranslateAnimation);

export function translateWithAnimation(game: Game): System {
  const query = registerQuery(game.essence, translateWithAnimationQuery);

  return function translateWithAnimation({ essence, deltaTime }) {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];
      const positionT = table(archetype, Position2);
      const animationT = table(archetype, TranslateAnimation);

      for (let j = 0; j < archetype.entities.length; j++) {
        const entity = archetype.entities[j];
        const position = positionT[j];
        const animation = animationT[j];

        // # If current position is the same as the target position, remove the animation component
        if (position.x === animation.x && position.y === animation.y) {
          removeComponent(essence, entity, TranslateAnimation);
          continue;
        }

        // # If current time is greater than the animation end time, set the position to the target position
        if (essence.currentStepTime >= animation.startTime + animation.duration) {
          position.x = animation.x;
          position.y = animation.y;

          removeComponent(essence, entity, TranslateAnimation);

          continue;
        }

        const animationDeltaTime = essence.currentStepTime - animation.startTime;

        // # animation delta time can be negative so just ignore this step
        if (animationDeltaTime < 0) {
          continue;
        }

        // # Calculate new position based on the easing function
        let newX = position.x;
        let newY = position.y;

        switch (animation.easing) {
          case 'easeIn':
            newX = round(
              applyEaseIn(
                animationDeltaTime,
                position.x,
                animation.x - position.x,
                animation.duration
              ),
              2
            );

            newY = round(
              applyEaseIn(
                animationDeltaTime,
                position.y,
                animation.y - position.y,
                animation.duration
              ),
              2
            );
            break;
          case 'easeOut':
            break;
          default:
            return safeGuard(animation.easing);
        }

        // QUESTION: maybe it will be needed
        // const targetPositionXDelta = Math.abs(Math.abs(animation.x) - Math.abs(newX));
        // const targetPositionYDelta = Math.abs(Math.abs(animation.y) - Math.abs(newY));

        // if (targetPositionXDelta < defaultPrecision) {
        //   newX = animation.x;
        // }

        // if (targetPositionYDelta < defaultPrecision) {
        //   newY = animation.y;
        // }

        // if (targetPositionXDelta < defaultPrecision && targetPositionYDelta < defaultPrecision) {
        //   removeComponent(essence, entity, TranslateAnimation);
        // }

        position.x = newX;
        position.y = newY;
      }
    }
  };
}

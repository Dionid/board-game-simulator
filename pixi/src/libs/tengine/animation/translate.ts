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

export const TranslateAnimation = newSchema({
  x: number,
  y: number,
  duration: number,
  easing,
  startTime: number,
});

export const translateWithAnimationQuery = newQuery(Position2, TranslateAnimation);

export function translateWithAnimation(game: Game, defaultPrecision = 0.1): System {
  const query = registerQuery(game.essence, translateWithAnimationQuery);

  return function translateWithAnimation({ deltaTime }) {
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
          removeComponent(game.essence, entity, TranslateAnimation);
          continue;
        }

        // # If current time is greater than the animation end time, set the position to the target position
        if (game.essence.currentStepTime >= animation.startTime + animation.duration) {
          position.x = animation.x;
          position.y = animation.y;

          removeComponent(game.essence, entity, TranslateAnimation);

          continue;
        }

        const animationDeltaTime = game.essence.currentStepTime - animation.startTime;

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

            console.log(position);
            break;
          case 'easeOut':
            break;
          default:
            return safeGuard(animation.easing);
        }

        const targetPositionXDelta = Math.abs(Math.abs(animation.x) - Math.abs(newX));
        const targetPositionYDelta = Math.abs(Math.abs(animation.y) - Math.abs(newY));

        if (targetPositionXDelta < defaultPrecision) {
          newX = animation.x;
        }

        if (targetPositionYDelta < defaultPrecision) {
          newY = animation.y;
        }

        position.x = newX;
        position.y = newY;

        if (targetPositionXDelta < defaultPrecision && targetPositionYDelta < defaultPrecision) {
          removeComponent(game.essence, entity, TranslateAnimation);
          continue;
        }
      }
    }
  };
}

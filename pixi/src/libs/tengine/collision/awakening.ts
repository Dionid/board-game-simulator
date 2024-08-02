import {
  newQuery,
  registerQuery,
  removeComponent,
  setComponent,
  System,
  table,
  tryTable,
} from 'libs/tecs';
import { Game } from '../game';
import { Awaken, ColliderBody } from './components';
import { Position2, Velocity2 } from '../core';

export const collidersQuery = newQuery(ColliderBody, Position2);

export function awakening(game: Game): System {
  const query = registerQuery(game.essence, collidersQuery);

  const awakenedIndex: number[] = [];

  return () => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];

      const positionT = table(archetype, Position2);
      const isAwake = tryTable(archetype, Awaken);
      const velocityT = tryTable(archetype, Velocity2);

      for (let i = 0; i < archetype.entities.length; i++) {
        const entity = archetype.entities[i];
        const position = positionT[i];

        let mustGoToSleep = false;

        if (isAwake) {
          awakenedIndex[entity] = awakenedIndex[entity] ? awakenedIndex[entity] + 1 : 1;

          if (awakenedIndex[entity] > 10) {
            mustGoToSleep = true;
          }
        }

        let mustBeAwaken = false;

        if (position._prev.x !== position.x || position._prev.y !== position.y) {
          mustBeAwaken = true;
        }

        if (velocityT && mustBeAwaken === false) {
          const velocity = velocityT[i];

          if (velocity.x !== 0 || velocity.y !== 0) {
            mustBeAwaken = true;
          }
        }

        if (mustBeAwaken) {
          awakenedIndex[entity] = 1;

          if (!isAwake) {
            setComponent(game.essence, entity, Awaken);
          }

          continue;
        }

        if (mustGoToSleep) {
          removeComponent(game.essence, entity, Awaken);
        }
      }
    }
  };
}

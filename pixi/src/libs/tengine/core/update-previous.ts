import { newQuery, registerQuery, System, table } from 'libs/tecs';
import { Game } from '../game';
import { Position2 } from './types';

export const positionQ = newQuery(Position2);

export const updatePreviousPosition = (game: Game): System => {
  const { essence } = game;

  const query = registerQuery(essence, positionQ);

  return () => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];

      const positionT = table(archetype, Position2);

      for (let j = 0; j < archetype.entities.length; j++) {
        const position = positionT[j];

        position._prev.x = position.x;
        position._prev.y = position.y;
      }
    }
  };
};

import { newQuery, registerQuery, System, table, tryTable } from 'libs/tecs';
import { Game } from '../game';
import { Angle, Position2 } from './types';

export const positionQ = newQuery(Position2);

export const updatePrevious = (game: Game): System => {
  const { essence } = game;

  const query = registerQuery(essence, positionQ);

  return () => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];

      const positionT = table(archetype, Position2);
      const angleT = tryTable(archetype, Angle);

      for (let j = 0; j < archetype.entities.length; j++) {
        const position = positionT[j];

        position._prev.x = position.x;
        position._prev.y = position.y;

        if (angleT) {
          const angle = angleT[j];

          angle._prev = angle.value;
        }
      }
    }
  };
};

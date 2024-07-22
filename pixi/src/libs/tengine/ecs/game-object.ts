import { registerQuery, System, table, tryTable } from '../../tecs';
import { newQuery } from '../../tecs/query';
import { View, Position, pGraphics, Color, Size } from './components';
import { Game } from '../game';
import { Map } from '../core';

const drawQuery = newQuery(View, Position, Size);

export const renderGameObjects = (game: Game, map: Map): System => {
  const query = registerQuery(game.essence, drawQuery);

  return () => {
    for (const archetype of query.archetypes) {
      const positionT = table(archetype, Position);
      const sizeT = table(archetype, Size);
      const graphicsT = tryTable(archetype, pGraphics);
      const colorT = tryTable(archetype, Color);

      for (let i = 0, l = archetype.entities.length; i < l; i++) {
        if (graphicsT) {
          const graphics = graphicsT[i].value;

          graphics.clear();
          graphics.rect(positionT[i].x, positionT[i].y, sizeT[i].width, sizeT[i].height);

          if (colorT) {
            graphics.fill(colorT[i].value);
          }

          if (graphics.parent === null) {
            map.container.addChild(graphics);
          }
        }
      }
    }
  };
};

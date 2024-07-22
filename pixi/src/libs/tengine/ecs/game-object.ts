import { registerQuery, System, table, tryTable } from '../../tecs';
import { newQuery } from '../../tecs/query';
import { View, Position, pGraphics, Color } from './components';
import { Game } from '../game';

const drawQuery = newQuery(View, Position);

export const calculateGameObjects = (game: Game): System => {
  const query = registerQuery(game.essence, drawQuery);

  return () => {
    for (const archetype of query.archetypes) {
      const positionT = table(archetype, Position);
      const graphicsT = tryTable(archetype, pGraphics);
      const colorT = tryTable(archetype, Color);

      for (let i = 0, l = archetype.entities.length; i < l; i++) {
        if (graphicsT) {
          const graphics = graphicsT[i].value;

          graphics.clear();
          graphics.circle(positionT[i].x, positionT[i].y, 50);

          if (colorT) {
            graphics.fill(colorT[i].value);
          }

          if (graphics.parent === null) {
            game.app.stage.addChild(graphics);
          }
        }
      }
    }
  };
};

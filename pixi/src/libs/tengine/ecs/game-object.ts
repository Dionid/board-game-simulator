import { registerQuery, System, table, tryTable } from '../../tecs';
import { newQuery } from '../../tecs/query';
import { View, Position, Color, Size, pGraphicsTag, pGraphicsType } from './components';
import { Game } from '../game';
import { Map } from '../core';
import { Graphics } from 'pixi.js';

const drawQuery = newQuery(View, Position, Size);

export const renderGameObjects = (game: Game, map: Map): System => {
  const query = registerQuery(game.essence, drawQuery);

  const globalGraphics = new Graphics();
  map.container.addChild(globalGraphics);

  return () => {
    globalGraphics.clear();

    for (const archetype of query.archetypes) {
      const positionT = table(archetype, Position);
      const sizeT = table(archetype, Size);

      const graphicsTag = tryTable(archetype, pGraphicsTag);
      const graphicsType = tryTable(archetype, pGraphicsType);
      const colorT = tryTable(archetype, Color);

      for (let i = 0, l = archetype.entities.length; i < l; i++) {
        if (graphicsTag && graphicsType) {
          switch (graphicsType[i].type) {
            case 'rect':
              globalGraphics.rect(positionT[i].x, positionT[i].y, sizeT[i].width, sizeT[i].height);
              break;
            case 'circle':
              globalGraphics.circle(positionT[i].x, positionT[i].y, sizeT[i].width / 2);
              break;
            default:
              break;
          }

          if (colorT) {
            globalGraphics.fill(colorT[i].value);
          }
        }
      }
    }
  };
};

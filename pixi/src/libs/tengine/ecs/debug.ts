import { Graphics } from 'pixi.js';
import { newQuery, registerQuery, System, table, tryTable } from '../../tecs';
import { Game } from '../game';
import { View, Position, Size, Shape } from './components';
import { Map } from '../core';

const drawQuery = newQuery(View, Position, Size);

export const drawDebugLines = (
  game: Game,
  map: Map,
  options: {
    graphics?: boolean;
    xy?: boolean;
  } = {}
): System => {
  options = {
    graphics: true,
    xy: true,
    ...options,
  };

  const query = registerQuery(game.essence, drawQuery);

  const globalGraphics = new Graphics();
  map.container.addChild(globalGraphics);

  const strokeWidth = 2;

  return () => {
    globalGraphics.clear();

    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];
      const positionT = table(archetype, Position);
      const sizeT = table(archetype, Size);

      const graphicsTypeT = tryTable(archetype, Shape);

      for (let j = 0; j < archetype.entities.length; j++) {
        const position = positionT[j];
        const size = sizeT[j];

        // # X Y position (anchor)
        if (options.xy) {
          globalGraphics.circle(position.x, position.y, 4);
          globalGraphics.fill({ color: 'red' });
        }

        if (options.graphics) {
          if (graphicsTypeT) {
            const graphicsType = graphicsTypeT[j];

            switch (graphicsType.name) {
              case 'rect':
                globalGraphics.rect(position.x, position.y, size.width, size.height);
                globalGraphics.stroke({ width: 2, color: 'purple' });
                break;
              case 'circle':
                globalGraphics.circle(position.x, position.y, size.width / 2);
                globalGraphics.stroke({ width: 2, color: 'purple' });
                break;
            }
          } else {
            globalGraphics.rect(
              position.x - strokeWidth / 2,
              position.y - strokeWidth / 2,
              size.width + strokeWidth,
              size.height + strokeWidth
            );
            globalGraphics.stroke({ width: 2, color: 'purple' });
          }
        }
      }
    }
  };
};

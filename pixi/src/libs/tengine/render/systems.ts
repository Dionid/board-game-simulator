import { newQuery, registerQuery, System, table, tryTable } from 'libs/tecs';
import { Position2, Rectangle, Circle, Color } from 'libs/tengine/core/components';
import { Map } from 'libs/tengine/core';
import { Game } from 'libs/tengine/game';
import { Graphics } from 'pixi.js';
import { View } from './components';

export const drawQuery = newQuery(View, Position2);

export const drawViews = (game: Game, map: Map): System => {
  const query = registerQuery(game.essence, drawQuery);

  const globalGraphics = new Graphics();
  map.container.addChild(globalGraphics);

  return () => {
    globalGraphics.clear();

    for (const archetype of query.archetypes) {
      const positionT = table(archetype, Position2);

      const rectangleT = tryTable(archetype, Rectangle);
      const circleT = tryTable(archetype, Circle);
      const colorT = tryTable(archetype, Color);

      for (let i = 0, l = archetype.entities.length; i < l; i++) {
        const position = positionT[i];
        const rectangle = rectangleT && rectangleT[i];
        const circle = circleT && circleT[i];

        if (rectangle) {
          globalGraphics.rect(
            position.x + rectangle.offset.x,
            position.y + rectangle.offset.y,
            rectangle.size.width,
            rectangle.size.height
          );
        }

        if (circle) {
          globalGraphics.circle(
            position.x + circle.offset.x,
            position.y + circle.offset.y,
            circle.radius
          );
        }

        if (colorT) {
          globalGraphics.fill(colorT[i].value);
        }
      }
    }
  };
};

export const render = (game: Game): System => {
  return () => {
    game.app.render();
  };
};

import { newQuery, registerQuery, System, table } from 'libs/tecs';
import { Position2 } from '../core/types';
import { Map } from 'libs/tengine/core';
import { Game } from 'libs/tengine/game';
import { Graphics } from 'pixi.js';
import { View } from './components';
import { safeGuard } from 'libs/tecs/switch';

export const drawQuery = newQuery(View, Position2);

export const drawViews = (game: Game, map: Map): System => {
  const query = registerQuery(game.essence, drawQuery);

  const globalGraphics = new Graphics();
  map.container.addChild(globalGraphics);

  return () => {
    globalGraphics.clear();

    for (const archetype of query.archetypes) {
      const positionT = table(archetype, Position2);
      const viewT = table(archetype, View);

      for (let i = 0, l = archetype.entities.length; i < l; i++) {
        const position = positionT[i];
        const view = viewT[i];

        switch (view.model.type) {
          case 'graphics': {
            switch (view.model.shape.type) {
              case 'rectangle': {
                globalGraphics.rect(
                  position.x + view.offset.x,
                  position.y + view.offset.y,
                  view.model.shape.size.width,
                  view.model.shape.size.height
                );
                break;
              }
              case 'circle': {
                globalGraphics.circle(
                  position.x + view.offset.x,
                  position.y + view.offset.y,
                  view.model.shape.radius
                );
                break;
              }
              case 'line': {
                globalGraphics.moveTo(position.x + view.offset.x, position.y + view.offset.y);
                globalGraphics.lineTo(
                  position.x + view.offset.x + view.model.shape.end.x,
                  position.y + view.offset.y + view.model.shape.end.y
                );
                globalGraphics.stroke({
                  width: 1,
                });
                break;
              }
              case 'polygon': {
                break;
              }
              default:
                return safeGuard(view.model.shape);
            }

            globalGraphics.fill(view.model.color);
            break;
          }
          case 'sprite': {
            break;
          }
          default:
            safeGuard(view.model);
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

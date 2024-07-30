import { newQuery, registerQuery, System, table } from 'libs/tecs';
import { Position2 } from '../core/types';
import { Map } from 'libs/tengine/core';
import { Game } from 'libs/tengine/game';
import { Container, Graphics } from 'pixi.js';
import { View } from './components';
import { safeGuard } from 'libs/tecs/switch';
import { drawCapsule, drawCircle, drawLine, drawRectangle } from './draw-shapes';

export const drawQuery = newQuery(View, Position2);

export const drawViews = (game: Game, map: Map): System => {
  const query = registerQuery(game.essence, drawQuery);

  const globalGraphicsContainer = new Container();
  map.container.addChild(globalGraphicsContainer);

  const globalGraphics = new Graphics();
  globalGraphicsContainer.addChild(globalGraphics);

  return () => {
    globalGraphics.clear();
    globalGraphics.removeChildren();

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
                const result = drawRectangle(view, position);

                if (!result) {
                  break;
                }

                globalGraphics.addChild(result.rectContainer);

                result.rect.fill(view.model.color);

                break;
              }
              case 'circle': {
                const circle = drawCircle(view, position);

                if (!circle) {
                  continue;
                }

                circle.fill(view.model.color);

                globalGraphics.addChild(circle);

                break;
              }
              case 'line': {
                const line = drawLine(view, position);

                if (!line) {
                  break;
                }

                line.fill(view.model.color);

                globalGraphics.addChild(line);

                break;
              }
              case 'capsule': {
                const capsule = drawCapsule(view, position);

                if (!capsule) {
                  break;
                }

                capsule.fill(view.model.color);

                globalGraphics.addChild(capsule);

                break;
              }
              case 'polygon': {
                break;
              }
              default:
                return safeGuard(view.model.shape);
            }
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

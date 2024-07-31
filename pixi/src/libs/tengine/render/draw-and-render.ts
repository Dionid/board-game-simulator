import {
  Component,
  newQuery,
  registerQuery,
  setComponent,
  System,
  table,
  tryTable,
} from 'libs/tecs';
import { Position2 } from '../core/types';
import { Game } from 'libs/tengine/game';
import { Container } from 'pixi.js';
import { pView, View } from './components';
import { safeGuard } from 'libs/tecs/switch';
import { drawCapsule, drawCircle, drawLine, drawRectangle } from './draw-shapes';

// TODO: Refactor to use filter `not`
export const newViewQuery = newQuery(View, Position2);

export const addNewViews = (game: Game, viewsContainer: Container): System => {
  const query = registerQuery(game.essence, newViewQuery);

  return () => {
    for (const archetype of query.archetypes) {
      const pViewT = tryTable(archetype, pView);

      // # If pView already exists, skip
      if (pViewT) {
        continue;
      }

      const viewT = table(archetype, View);
      const positionT = table(archetype, Position2);

      for (let i = 0, l = archetype.entities.length; i < l; i++) {
        const view = viewT[i];
        const position = positionT[i];

        let pViewComponent: Component<typeof pView>;

        switch (view.model.type) {
          case 'graphics': {
            switch (view.model.shape.type) {
              case 'rectangle': {
                const result = drawRectangle(view, position);

                if (!result) {
                  break;
                }

                result.graphics.fill(view.model.color);

                viewsContainer.addChild(result.container);

                pViewComponent = result;

                break;
              }
              case 'circle': {
                const result = drawCircle(view, position);

                if (!result) {
                  continue;
                }

                result.graphics.fill(view.model.color);

                viewsContainer.addChild(result.container);

                pViewComponent = result;

                break;
              }
              case 'line': {
                const line = drawLine(view, position);

                if (!line) {
                  break;
                }

                line.fill(view.model.color);

                viewsContainer.addChild(line);

                break;
              }
              case 'capsule': {
                const capsule = drawCapsule(view, position);

                if (!capsule) {
                  break;
                }

                capsule.fill(view.model.color);

                viewsContainer.addChild(capsule);

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

        setComponent(game.essence, archetype.entities[i], pView, pViewComponent!);
      }
    }
  };
};

// # Apply changes

export const drawQuery = newQuery(View, pView, Position2);

export const drawViews = (game: Game): System => {
  const query = registerQuery(game.essence, drawQuery);

  return () => {
    for (const archetype of query.archetypes) {
      const positionT = table(archetype, Position2);
      const pViewT = table(archetype, pView);
      const viewT = table(archetype, View);

      for (let i = 0, l = archetype.entities.length; i < l; i++) {
        const position = positionT[i];
        const pView = pViewT[i];
        const view = viewT[i];

        if (pView.container.rotation !== view.rotation) {
          pView.container.rotation = view.rotation;
        }

        if (position.x !== pView.container.x || position.y !== pView.container.y) {
          pView.container.x = position.x;
          pView.container.y = position.y;
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

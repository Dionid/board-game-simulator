import {
  Component,
  componentByEntity,
  newQuery,
  registerQuery,
  registerTopic,
  setComponent,
  System,
  table,
  tryTable,
} from 'libs/tecs';
import { Angle, Position2 } from '../core/types';
import { Game } from 'libs/tengine/game';
import { Container } from 'pixi.js';
import { pView, View } from './components';
import { safeGuard } from 'libs/tecs/switch';
import { circleView, circleViewPivot, rectangleView, rectangleViewPivot } from './draw-shapes';
import { entityKilled } from 'libs/tecs/default-topics';

// TODO: Refactor to use filter `not`
export const newViewQuery = newQuery(View, Position2);

export const addNewViews = (game: Game, viewsContainer: Container): System => {
  const query = registerQuery(game.essence, newViewQuery);
  registerTopic(game.essence, entityKilled);

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
                const result = rectangleView(view, position);

                if (!result) {
                  break;
                }

                result.container.alpha = view.alpha;
                result.graphics.fill(view.model.color);

                viewsContainer.addChild(result.container);

                pViewComponent = result;

                break;
              }
              case 'circle': {
                const result = circleView(view, position);

                if (!result) {
                  continue;
                }

                result.graphics.fill(view.model.color);

                viewsContainer.addChild(result.container);

                pViewComponent = result;

                break;
              }
              // case 'line': {
              //   const line = drawLine(view, position);

              //   if (!line) {
              //     break;
              //   }

              //   line.fill(view.model.color);

              //   viewsContainer.addChild(line);

              //   break;
              // }
              // case 'capsule': {
              //   const capsule = drawCapsule(view, position);

              //   if (!capsule) {
              //     break;
              //   }

              //   capsule.fill(view.model.color);

              //   viewsContainer.addChild(capsule);

              //   break;
              // }
              // case 'polygon': {
              //   break;
              // }
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

    // # Destroy pView on entity killed
    for (const event of entityKilled) {
      const entity = event.entity;

      const pv = componentByEntity(game.essence, entity, pView);

      if (pv) {
        pv.graphics.destroy();
        pv.container.destroy();
        viewsContainer.removeChild(pv.container);
      }
    }
  };
};

// # Apply changes

export const drawQuery = newQuery(View, pView, Position2);

export const drawViews = (game: Game): System => {
  const query = registerQuery(game.essence, drawQuery);

  // TODO: change to previous state component
  const cache: {
    anchor: { x: number; y: number };
  }[] = [];

  return () => {
    for (const archetype of query.archetypes) {
      const positionT = table(archetype, Position2);
      const pViewT = table(archetype, pView);
      const viewT = table(archetype, View);

      const angleT = tryTable(archetype, Angle);

      for (let i = 0, l = archetype.entities.length; i < l; i++) {
        const entity = archetype.entities[i];
        const position = positionT[i];
        const pView = pViewT[i];
        const view = viewT[i];

        let cached = cache[entity];

        if (!cached) {
          cached = {
            anchor: {
              x: view.anchor.x,
              y: view.anchor.y,
            },
          };
        }

        const parentAngle = angleT ? angleT[i].value : 0;

        // # Rotation changed
        if (view.rotation !== pView.container.rotation + parentAngle) {
          pView.container.rotation = view.rotation + parentAngle;
        }

        if (view.alpha !== pView.container.alpha) {
          pView.container.alpha = view.alpha;
        }

        // # Scale changed
        if (view.scale.x !== pView.container.scale.x || view.scale.y !== pView.container.scale.y) {
          pView.container.scale.set(view.scale.x, view.scale.y);
        }

        // # Position changed
        if (position.x !== position._prev.x || position.y !== position._prev.y) {
          pView.container.x = position.x + view.offset.x;
          pView.container.y = position.y + view.offset.y;
        }

        // # Anchor changed
        if (cached.anchor.x !== view.anchor.x || cached.anchor.y !== view.anchor.y) {
          switch (view.model.type) {
            case 'graphics': {
              switch (view.model.shape.type) {
                case 'circle': {
                  const pivot = circleViewPivot(view.model.shape.radius, view.anchor);

                  pView.container.pivot.set(pivot.x, pivot.y);

                  break;
                }
                case 'rectangle': {
                  const pivot = rectangleViewPivot(view.model.shape.size, view.anchor);

                  pView.container.pivot.set(pivot.x, pivot.y);

                  break;
                }
                default:
                  safeGuard(view.model.shape);
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
    }
  };
};

export const render = (game: Game): System => {
  return () => {
    game.app.render();
  };
};

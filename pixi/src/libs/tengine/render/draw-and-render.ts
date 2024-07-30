import { newQuery, registerQuery, System, table, tryTable } from 'libs/tecs';
import { Position2, Rotation } from '../core/types';
import {
  addV2,
  crossV2,
  dotV2,
  horizontalVector,
  magV2,
  Map,
  multiplyMatrixV2,
  multV2,
  rotationMatrix,
  subV2,
  unitV2,
} from 'libs/tengine/core';
import { Game } from 'libs/tengine/game';
import { Container, Graphics } from 'pixi.js';
import { View } from './components';
import { safeGuard } from 'libs/tecs/switch';
import { drawCapsule, drawCircle, drawRectangle } from './draw-shapes';

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

      const rotationT = tryTable(archetype, Rotation);

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
                const anchor = view.model.shape.anchor;

                const length = view.model.shape.length;

                const start = {
                  x: position.x + view.offset.x,
                  y: position.y + view.offset.y - length * anchor,
                };

                const end = {
                  x: start.x,
                  y: start.y + length,
                };

                if (rotationT) {
                  const centerOffset = {
                    x: 0,
                    y: 0.5,
                  };

                  const center = {
                    x: start.x + length * centerOffset.x,
                    y: start.y + length * centerOffset.y,
                  };

                  globalGraphics.circle(center.x, center.y, 4);
                  globalGraphics.fill({ color: 'purple' });

                  const lineVector = subV2(end, start);

                  const refUnit = unitV2(lineVector);

                  const rotMatrix = rotationMatrix(rotationT[i].value);

                  const newDirection = multiplyMatrixV2(rotMatrix, refUnit);

                  // if it is in start
                  const newStart = addV2(center, multV2(newDirection, -length / 2));
                  const newEnd = addV2(center, multV2(newDirection, length / 2));

                  // debugger;

                  end.x = newEnd.x;
                  end.y = newEnd.y;

                  start.x = newStart.x;
                  start.y = newStart.y;
                }

                globalGraphics.moveTo(start.x, start.y);
                globalGraphics.lineTo(end.x, end.y);
                globalGraphics.stroke({
                  width: 1,
                });

                globalGraphics.fill(view.model.color);
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

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

      const rotationT = tryTable(archetype, Rotation);

      for (let i = 0, l = archetype.entities.length; i < l; i++) {
        const position = positionT[i];
        const view = viewT[i];

        switch (view.model.type) {
          case 'graphics': {
            switch (view.model.shape.type) {
              case 'rectangle': {
                const anchor = view.model.shape.anchor;
                globalGraphics.rect(
                  // position will be in the center of the shape
                  position.x + view.offset.x - view.model.shape.size.width * anchor.x,
                  position.y + view.offset.y - view.model.shape.size.height * anchor.y,
                  view.model.shape.size.width,
                  view.model.shape.size.height
                );
                break;
              }
              case 'circle': {
                const anchor = view.model.shape.anchor;

                globalGraphics.circle(
                  position.x +
                    view.offset.x +
                    view.model.shape.radius -
                    view.model.shape.radius * 2 * anchor.x,
                  position.y +
                    view.offset.y +
                    view.model.shape.radius -
                    view.model.shape.radius * 2 * anchor.y,
                  view.model.shape.radius
                );
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
                break;
              }
              case 'capsule': {
                // # Draw capsule
                const anchor = view.model.shape.anchor;

                const length = view.model.shape.length;
                const radius = view.model.shape.radius;

                const start = {
                  x: position.x + view.offset.x + radius - radius * 2 * anchor.x,
                  y: position.y + view.offset.y - length * anchor.y,
                };

                const end = {
                  x: start.x,
                  y: start.y + length,
                };

                if (rotationT) {
                  const lineVector = subV2(end, start);
                  const length = magV2(lineVector);

                  const refUnit = unitV2(lineVector);

                  const rotMatrix = rotationMatrix(rotationT[i].value);

                  const newDirection = multiplyMatrixV2(rotMatrix, refUnit);

                  // if it is in start
                  const newStart = addV2(start, multV2(newDirection, -length / 2));
                  const newEnd = addV2(start, multV2(newDirection, length / 2));

                  end.x = newEnd.x;
                  end.y = newEnd.y;

                  start.x = newStart.x;
                  start.y = newStart.y;
                }

                // # Inner
                globalGraphics.moveTo(start.x, start.y);
                globalGraphics.lineTo(end.x, end.y);

                globalGraphics.stroke({
                  width: 1,
                  color: 'red',
                });

                // # Outer
                // ## Calculate arcs angel to horizontal line
                const refDirection = unitV2(subV2(end, start));
                let refAngle = Math.acos(dotV2(refDirection, horizontalVector));

                if (crossV2(refDirection, horizontalVector) > 0) {
                  refAngle = -refAngle;
                }

                globalGraphics.beginPath();

                globalGraphics.arc(
                  start.x,
                  start.y,
                  radius,
                  refAngle + Math.PI / 2,
                  refAngle + (3 * Math.PI) / 2
                );
                globalGraphics.arc(
                  end.x,
                  end.y,
                  radius,
                  refAngle - Math.PI / 2,
                  refAngle + Math.PI / 2
                );

                globalGraphics.closePath();

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

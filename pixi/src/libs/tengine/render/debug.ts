import { Graphics } from 'pixi.js';
import { newQuery, registerQuery, System, table, tryTable } from '../../tecs';
import { Game } from '../game';
import { Acceleration2, Position2, Velocity2 } from '../core';
import { Map, Vector2 } from '../core';
import { ColliderSet } from '../collision';
import { View } from './components';
import { safeGuard } from 'libs/tecs/switch';
import { drawCapsule, drawCircle, drawRectangle } from './draw-shapes';

const drawLineFromCenter = (
  globalGraphics: Graphics,
  center: Vector2,
  target: Vector2,
  strokeWidth: number = 2,
  color: string = 'green'
) => {
  globalGraphics.moveTo(center.x, center.y);
  globalGraphics.lineTo(center.x + target.x * 10, center.y + target.y * 10);
  globalGraphics.stroke({ width: strokeWidth, color });
};

const drawQuery = newQuery(View, Position2);

export const drawDebugLines = (
  game: Game,
  map: Map,
  options: {
    view?: boolean;
    xy?: boolean;
    collision?: boolean;
    velocity?: boolean;
    acceleration?: boolean;
  } = {}
): System => {
  options = {
    view: true,
    xy: true,
    collision: true,
    velocity: true,
    acceleration: true,
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
      const positionT = table(archetype, Position2);

      const colliderSetT = tryTable(archetype, ColliderSet);
      const viewT = tryTable(archetype, View);

      const velocity2T = tryTable(archetype, Velocity2);
      const acceleration2T = tryTable(archetype, Acceleration2);

      for (let j = 0; j < archetype.entities.length; j++) {
        const position = positionT[j];

        // # X Y position (anchor)
        if (options.xy) {
          globalGraphics.circle(position.x, position.y, 4);
          globalGraphics.fill({ color: 'red' });
        }

        // # Collision
        if (options.collision) {
          if (colliderSetT) {
            const colliderSet = colliderSetT[j];
            for (const collider of colliderSet.list) {
              switch (collider.shape.type) {
                case 'line':
                  const anchor = 0.5;

                  const length = collider.shape.length;

                  const start = {
                    x: position.x + collider.offset.x,
                    y: position.y + collider.offset.y - length * anchor,
                  };

                  const end = {
                    x: start.x,
                    y: start.y + length,
                  };

                  globalGraphics.moveTo(start.x, start.y);
                  globalGraphics.lineTo(end.x, end.y);
                  globalGraphics.stroke({
                    width: 1,
                  });
                  break;
                case 'constant_rectangle':
                  globalGraphics.rect(
                    collider._position.x,
                    collider._position.y,
                    collider.shape.width,
                    collider.shape.height
                  );
                  globalGraphics.stroke({ width: strokeWidth, color: 'gray' });
                  break;
                case 'circle':
                  globalGraphics.circle(
                    collider._position.x,
                    collider._position.y,
                    collider.shape.radius
                  );
                  globalGraphics.stroke({ width: strokeWidth, color: 'gray' });
                  break;
              }
            }
          }
        }

        if (options.acceleration || options.velocity) {
          const center = {
            x: position.x,
            y: position.y,
          };

          if (options.acceleration && acceleration2T) {
            drawLineFromCenter(globalGraphics, center, acceleration2T[j], strokeWidth, 'blue');
          }
          if (options.velocity && velocity2T) {
            drawLineFromCenter(globalGraphics, center, velocity2T[j], strokeWidth, 'green');
          }
        }

        // # Graphics
        if (options.view && viewT) {
          const view = viewT[j];

          switch (view.model.type) {
            case 'graphics':
              switch (view.model.shape.type) {
                case 'circle':
                  const circle = drawCircle(view, position);

                  if (!circle) {
                    break;
                  }

                  globalGraphics.addChild(circle);

                  circle.stroke({ width: strokeWidth, color: 'purple' });

                  break;
                case 'rectangle':
                  const result = drawRectangle(view, position);

                  if (!result) {
                    break;
                  }

                  globalGraphics.addChild(result.rectContainer);

                  result.rect.stroke({ width: strokeWidth, color: 'purple' });

                  break;
                case 'line':
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

                  globalGraphics.moveTo(start.x, start.y);
                  globalGraphics.lineTo(end.x, end.y);
                  globalGraphics.stroke({
                    width: 1,
                  });
                  break;
                case 'capsule':
                  const capsule = drawCapsule(view, position);

                  if (!capsule) {
                    break;
                  }

                  globalGraphics.addChild(capsule);

                  capsule.stroke({ width: strokeWidth, color: 'purple' });

                  break;
                case 'polygon':
                  break;
                default:
                  safeGuard(view.model.shape);
              }
              globalGraphics.stroke({ width: strokeWidth, color: 'purple' });
              break;
            case 'sprite':
              break;
            default:
              safeGuard(view.model);
          }
        }
      }
    }
  };
};

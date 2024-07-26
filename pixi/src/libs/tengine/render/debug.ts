import { Graphics } from 'pixi.js';
import { newQuery, registerQuery, System, table, tryTable } from '../../tecs';
import { Game } from '../game';
import { Acceleration2, Position2, Velocity2 } from '../physics/components';
import { Map, Position2 as P2, Vector2 } from '../core';
import { ColliderSet } from '../collision';
import { Circle, Rectangle, View } from './components';

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
    graphics?: boolean;
    xy?: boolean;
    collision?: boolean;
    velocity?: boolean;
    acceleration?: boolean;
  } = {}
): System => {
  options = {
    graphics: true,
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
      const rectangleT = tryTable(archetype, Rectangle);
      const circleT = tryTable(archetype, Circle);

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
                case 'rectangle':
                  globalGraphics.rect(
                    position.x,
                    position.y,
                    collider.shape.width,
                    collider.shape.height
                  );
                  globalGraphics.stroke({ width: strokeWidth, color: 'gray' });
                  break;
                case 'circle':
                  globalGraphics.circle(position.x, position.y, collider.shape.radius);
                  globalGraphics.stroke({ width: strokeWidth, color: 'gray' });
                  break;
              }
            }
          }
        }

        // # Graphics
        if (options.graphics) {
          if (rectangleT) {
            const rectangle = rectangleT[j];
            globalGraphics.rect(
              position.x + rectangle.offset.x,
              position.y + rectangle.offset.y,
              rectangle.size.width,
              rectangle.size.height
            );
            globalGraphics.stroke({ width: strokeWidth, color: 'purple' });

            if (acceleration2T || velocity2T) {
              const center = {
                x: position.x + rectangle.offset.x + rectangle.size.width / 2,
                y: position.y + rectangle.offset.y + rectangle.size.height / 2,
              };

              if (acceleration2T) {
                drawLineFromCenter(globalGraphics, center, acceleration2T[j], strokeWidth, 'blue');
              }

              if (velocity2T) {
                drawLineFromCenter(globalGraphics, center, velocity2T[j], strokeWidth, 'green');
              }
            }
          }

          if (circleT) {
            const circle = circleT[j];
            globalGraphics.circle(
              position.x + circle.offset.x,
              position.y + circle.offset.y,
              circle.radius
            );
            globalGraphics.stroke({ width: strokeWidth, color: 'purple' });

            if (acceleration2T || velocity2T) {
              const center = {
                x: position.x,
                y: position.y,
              };

              if (acceleration2T) {
                drawLineFromCenter(globalGraphics, center, acceleration2T[j], strokeWidth, 'blue');
              }

              if (velocity2T) {
                drawLineFromCenter(globalGraphics, center, velocity2T[j], strokeWidth, 'green');
              }
            }
          }
        }
      }
    }
  };
};

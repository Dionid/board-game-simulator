import { Graphics } from 'pixi.js';
import { newQuery, registerQuery, System, table, tryTable } from '../../tecs';
import { Game } from '../game';
import { Position2, Rectangle, Circle } from '../core/components';
import { Map } from '../core';
import { ColliderSet } from '../collision';
import { View } from './components';

const drawQuery = newQuery(View, Position2);

export const drawDebugLines = (
  game: Game,
  map: Map,
  options: {
    graphics?: boolean;
    xy?: boolean;
    collision?: boolean;
  } = {}
): System => {
  options = {
    graphics: true,
    xy: true,
    collision: true,
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

      for (let j = 0; j < archetype.entities.length; j++) {
        const position = positionT[j];

        // # X Y position (anchor)
        if (options.xy) {
          globalGraphics.circle(position.x, position.y, 4);
          globalGraphics.fill({ color: 'red' });
        }

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
          } else if (circleT) {
            const circle = circleT[j];
            globalGraphics.circle(
              position.x + circle.offset.x,
              position.y + circle.offset.y,
              circle.radius
            );
            globalGraphics.stroke({ width: strokeWidth, color: 'purple' });
          }
        }
      }
    }
  };
};

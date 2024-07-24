import { Graphics } from 'pixi.js';
import { newQuery, registerQuery, SchemaType, System, table, tryTable } from '../../tecs';
import { Game } from '../game';
import { View, Position, Size, Shape } from './components';
import { Map } from '../core';
import { ColliderSet } from '../collision';

const drawQuery = newQuery(View, Position, Size);

export const drawShapeLines = (
  globalGraphics: Graphics,
  shape: SchemaType<typeof Shape>,
  position: SchemaType<typeof Position>,
  size: SchemaType<typeof Size>,
  color: string,
  strokeWidth = 2
) => {
  switch (shape.name) {
    case 'rectangle':
      globalGraphics.rect(position.x, position.y, size.width, size.height);
      globalGraphics.stroke({ width: strokeWidth, color });
      break;
    case 'circle':
      globalGraphics.circle(position.x, position.y, size.width / 2);
      globalGraphics.stroke({ width: strokeWidth, color });
      break;
  }
};

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
      const positionT = table(archetype, Position);
      const sizeT = table(archetype, Size);

      const collisionBodyT = tryTable(archetype, ColliderSet);
      const shapeT = tryTable(archetype, Shape);

      for (let j = 0; j < archetype.entities.length; j++) {
        const position = positionT[j];
        const size = sizeT[j];

        // # X Y position (anchor)
        if (options.xy) {
          globalGraphics.circle(position.x, position.y, 4);
          globalGraphics.fill({ color: 'red' });
        }

        if (options.collision) {
          if (collisionBodyT) {
            const collisionBody = collisionBodyT[j];

            for (const part of collisionBody.list) {
              drawShapeLines(
                globalGraphics,
                part.shape,
                {
                  x: position.x + part.position.x,
                  y: position.y + part.position.y,
                },
                part.size,
                'gray',
                2
              );
            }
          }
        }

        if (options.graphics) {
          if (shapeT) {
            const shape = shapeT[j];
            drawShapeLines(globalGraphics, shape, position, size, 'purple');
          } else {
            globalGraphics.rect(
              position.x - strokeWidth / 2,
              position.y - strokeWidth / 2,
              size.width + strokeWidth,
              size.height + strokeWidth
            );
            globalGraphics.stroke({ width: 2, color: 'purple' });
          }
        }
      }
    }
  };
};

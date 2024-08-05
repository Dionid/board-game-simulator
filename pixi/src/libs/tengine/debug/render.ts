import { Graphics } from 'pixi.js';
import { newQuery, registerQuery, System, table, tryTable } from '../../tecs';
import { Game } from '../game';
import { Acceleration2, multV2, Position2, Velocity2 } from '../core';
import { Map, Vector2 } from '../core';
import { ColliderBody } from '../collision';
import { pView, View } from '../render/components';

const drawLine = (
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

const debugViewQuery = newQuery(View, Position2);
const debugPositionQuery = newQuery(Position2);
const debugPViewQuery = newQuery(pView);
const debugCollisionSetQuery = newQuery(ColliderBody, Position2);

export const globalDebugGraphicsDeferred: ((g: Graphics) => void)[] = [];

export const drawDebugLines = (
  game: Game,
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

  const query = registerQuery(game.essence, debugViewQuery);
  const pQuery = registerQuery(game.essence, debugPViewQuery);
  const collisionQuery = registerQuery(game.essence, debugCollisionSetQuery);
  const positionQuery = registerQuery(game.essence, debugPositionQuery);

  const globalDebugGraphics = new Graphics();
  game.world.container.addChild(globalDebugGraphics);

  const strokeWidth = 2;

  return () => {
    globalDebugGraphics.clear();
    globalDebugGraphics.removeChildren();

    while (globalDebugGraphicsDeferred.length > 0) {
      const deferred = globalDebugGraphicsDeferred.pop()!;
      deferred(globalDebugGraphics);
    }

    if (options.view) {
      for (let i = 0; i < pQuery.archetypes.length; i++) {
        const archetype = pQuery.archetypes[i];
        const pViewT = table(archetype, pView);

        for (let j = 0; j < archetype.entities.length; j++) {
          const pView = pViewT[j];

          pView.graphics.stroke({ width: strokeWidth, color: 'purple' });
        }
      }
    }

    if (options.collision) {
      for (let i = 0; i < collisionQuery.archetypes.length; i++) {
        const archetype = collisionQuery.archetypes[i];
        const collisionSetT = table(archetype, ColliderBody);

        for (let j = 0; j < archetype.entities.length; j++) {
          const collisionSet = collisionSetT[j];

          for (const collider of collisionSet.parts) {
            if (collider.shape.type === 'circle') {
              globalDebugGraphics.circle(
                collider._position.x,
                collider._position.y,
                collider.shape.radius
              );
              globalDebugGraphics.stroke({ width: strokeWidth, color: 'gray' });
            }

            if (collider._vertices.length === 0) {
              continue;
            }

            globalDebugGraphics.circle(collider._position.x, collider._position.y, 3);
            globalDebugGraphics.fill({ color: 'gray' });

            globalDebugGraphics.beginPath();
            globalDebugGraphics.moveTo(collider._vertices[0].x, collider._vertices[0].y);
            for (let i = 1; i < collider._vertices.length; i++) {
              globalDebugGraphics.lineTo(collider._vertices[i].x, collider._vertices[i].y);
            }
            globalDebugGraphics.lineTo(collider._vertices[0].x, collider._vertices[0].y);
            globalDebugGraphics.stroke({ width: strokeWidth, color: 'gray' });
            globalDebugGraphics.closePath();
          }
        }
      }
    }

    // # X Y position (anchor)
    if (options.xy) {
      for (let i = 0; i < positionQuery.archetypes.length; i++) {
        const archetype = positionQuery.archetypes[i];
        const positionT = table(archetype, Position2);

        for (let j = 0; j < archetype.entities.length; j++) {
          const position = positionT[j];

          globalDebugGraphics.circle(position.x, position.y, 2);
          globalDebugGraphics.fill({ color: 'red' });
        }
      }
    }

    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];
      const positionT = table(archetype, Position2);

      const velocity2T = tryTable(archetype, Velocity2);
      const acceleration2T = tryTable(archetype, Acceleration2);

      for (let j = 0; j < archetype.entities.length; j++) {
        const position = positionT[j];

        // # Velocity and Acceleration
        if (options.acceleration || options.velocity) {
          if (options.acceleration && acceleration2T) {
            drawLine(
              globalDebugGraphics,
              position,
              multV2(acceleration2T[j], 2),
              strokeWidth,
              'yellow'
            );
          }
          if (options.velocity && velocity2T) {
            drawLine(globalDebugGraphics, position, velocity2T[j], strokeWidth, 'green');
          }
        }
      }
    }
  };
};

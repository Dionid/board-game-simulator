import { Graphics } from 'pixi.js';
import { newQuery, registerQuery, System, table, tryTable } from '../../tecs';
import { Game } from '../game';
import { Acceleration2, multV2, Position2, Velocity2 } from '../core';
import { Map, Vector2 } from '../core';
import { ColliderSet } from '../collision';
import { pView, View } from './components';

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
const debugPViewQuery = newQuery(pView);
const debugCollisionSetQuery = newQuery(ColliderSet, Position2);

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

  const query = registerQuery(game.essence, debugViewQuery);
  const pQuery = registerQuery(game.essence, debugPViewQuery);
  const collisionQuery = registerQuery(game.essence, debugCollisionSetQuery);

  const globalGraphics = new Graphics();
  map.container.addChild(globalGraphics);

  const strokeWidth = 2;

  return () => {
    globalGraphics.clear();
    globalGraphics.removeChildren();

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
        const collisionSetT = table(archetype, ColliderSet);

        for (let j = 0; j < archetype.entities.length; j++) {
          const collisionSet = collisionSetT[j];

          for (const collider of collisionSet.list) {
            if (collider.shape.type === 'circle') {
              globalGraphics.circle(
                collider._position.x,
                collider._position.y,
                collider.shape.radius
              );
              globalGraphics.stroke({ width: strokeWidth, color: 'gray' });
            }

            if (collider._vertices.length === 0) {
              continue;
            }

            globalGraphics.beginPath();
            globalGraphics.moveTo(collider._vertices[0].x, collider._vertices[0].y);
            for (let i = 1; i < collider._vertices.length; i++) {
              globalGraphics.lineTo(collider._vertices[i].x, collider._vertices[i].y);
            }
            globalGraphics.lineTo(collider._vertices[0].x, collider._vertices[0].y);
            globalGraphics.stroke({ width: strokeWidth, color: 'gray' });
            globalGraphics.closePath();
          }
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

        // # X Y position (anchor)
        if (options.xy) {
          globalGraphics.circle(position.x, position.y, 4);
          globalGraphics.fill({ color: 'red' });
        }

        // # Velocity and Acceleration
        if (options.acceleration || options.velocity) {
          if (options.acceleration && acceleration2T) {
            drawLine(globalGraphics, position, multV2(acceleration2T[j], 2), strokeWidth, 'yellow');
          }
          if (options.velocity && velocity2T) {
            drawLine(globalGraphics, position, velocity2T[j], strokeWidth, 'green');
          }
        }
      }
    }
  };
};

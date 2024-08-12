import { Graphics } from 'pixi.js';
import { newQuery, registerQuery, System, table } from '../../tecs';
import { Game } from '../game';
import { Acceleration2, multV2, Position2, Velocity2 } from '../core';
import { Vector2 } from '../core';
import { ColliderBody } from '../collision';
import { pView } from '../render/components';

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

const debugPositionQuery = newQuery(Position2);
const debugAccelerationQuery = newQuery(Position2, Acceleration2);
const debugVelocityQuery = newQuery(Position2, Velocity2);
const debugPViewQuery = newQuery(pView);
const debugCollisionSetQuery = newQuery(ColliderBody, Position2);

export const globalDebugGraphicsDeferred: ((g: Graphics, options: DebugOptions) => void)[] = [];

export type DebugOptions = {
  view?: boolean;
  xy?: boolean;
  collision?: boolean;
  collisionPivot?: boolean;
  castings?: boolean;
  velocity?: boolean;
  acceleration?: boolean;
};

export const drawDebug = (game: Game, options: DebugOptions = {}): System => {
  options = {
    view: true,
    xy: true,
    collision: true,
    velocity: true,
    acceleration: true,
    castings: true,
    collisionPivot: true,
    ...options,
  };

  const pQuery = registerQuery(game.essence, debugPViewQuery);
  const collisionQuery = registerQuery(game.essence, debugCollisionSetQuery);
  const positionQuery = registerQuery(game.essence, debugPositionQuery);
  const accelerationQuery = registerQuery(game.essence, debugAccelerationQuery);
  const velocityQuery = registerQuery(game.essence, debugVelocityQuery);

  const globalDebugGraphics = new Graphics();
  game.world.container.addChild(globalDebugGraphics);

  globalDebugGraphics.zIndex = 1000;

  const strokeWidth = 1;

  return () => {
    globalDebugGraphics.clear();
    globalDebugGraphics.removeChildren();

    while (globalDebugGraphicsDeferred.length > 0) {
      const deferred = globalDebugGraphicsDeferred.pop()!;
      deferred(globalDebugGraphics, options);
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

            if (options.collisionPivot) {
              globalDebugGraphics.circle(collider._position.x, collider._position.y, 3);
              globalDebugGraphics.fill({ color: 'gray' });
            }

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

    if (options.acceleration) {
      for (let i = 0; i < accelerationQuery.archetypes.length; i++) {
        const archetype = accelerationQuery.archetypes[i];
        const positionT = table(archetype, Position2);
        const acceleration2T = table(archetype, Acceleration2);

        for (let j = 0; j < archetype.entities.length; j++) {
          drawLine(
            globalDebugGraphics,
            positionT[j],
            multV2(acceleration2T[j], 2),
            strokeWidth,
            'yellow'
          );
        }
      }
    }

    if (options.velocity) {
      for (let i = 0; i < velocityQuery.archetypes.length; i++) {
        const archetype = velocityQuery.archetypes[i];
        const positionT = table(archetype, Position2);
        const velocity2T = table(archetype, Velocity2);

        for (let j = 0; j < archetype.entities.length; j++) {
          drawLine(globalDebugGraphics, positionT[j], velocity2T[j], strokeWidth, 'green');
        }
      }
    }
  };
};

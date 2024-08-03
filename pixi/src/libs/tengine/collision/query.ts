import { SchemaToType } from 'libs/tecs';
import { Vector2 } from '../core';
import { Collider, ColliderBody, rectangleColliderComponentSE } from './components';
import { collides } from './collision';
import { globalDebugGraphicsDeferred } from '../render';

export function ray(
  bodies: SchemaToType<typeof ColliderBody>[],
  start: Vector2,
  end: Vector2,
  opts: {
    width?: number;
    stopOnFirst?: boolean;
  } = {}
): {
  colliderBody: SchemaToType<typeof ColliderBody>;
  collider: SchemaToType<typeof Collider>;
}[] {
  const width = opts.width ?? 1;
  const stopOnFirst = opts.stopOnFirst ?? false;

  const rayCollider = rectangleColliderComponentSE({
    start,
    end,
    type: 'sensor',
    mass: 0,
    anchor: {
      x: 0.5,
      y: 0,
    },
    width,
  });

  globalDebugGraphicsDeferred.push((graphics) => {
    for (let i = 0; i < rayCollider._vertices.length; i++) {
      const start = rayCollider._vertices[i];
      const end = rayCollider._vertices[(i + 1) % rayCollider._vertices.length];

      graphics.moveTo(start.x, start.y);
      graphics.lineTo(end.x, end.y);
    }
    graphics.stroke({ color: 'green' });
  });

  const result = [];

  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];

    for (let j = 0; j < body.parts.length; j++) {
      const part = body.parts[j];

      let collision = collides(rayCollider, part);

      if (collision) {
        result.push({
          colliderBody: body,
          collider: part,
        });

        if (stopOnFirst) {
          return result;
        }
      }
    }
  }

  return result;
}

import { SchemaToType } from 'libs/tecs';
import { Axis2, Vector2, Vertices2 } from '../core';
import { Collider, ColliderBody, rectangleColliderComponentSE } from './components';
import { collides } from './collision';
import { DEBUG, globalDebugGraphicsDeferred } from '../debug';

export type CastingResult = {
  colliderBody: SchemaToType<typeof ColliderBody>;
  collider: SchemaToType<typeof Collider>;
  overlap: number;
  axis: Axis2;
};

export function castRay(
  bodies: SchemaToType<typeof ColliderBody>[] | SchemaToType<typeof ColliderBody>,
  start: Vector2,
  end: Vector2,
  opts: {
    width?: number;
    stopOnFirst?: boolean;
  } = {}
): CastingResult[] {
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

  if (DEBUG.isActive) {
    globalDebugGraphicsDeferred.push((graphics) => {
      for (let i = 0; i < rayCollider._vertices.length; i++) {
        const start = rayCollider._vertices[i];
        const end = rayCollider._vertices[(i + 1) % rayCollider._vertices.length];

        graphics.moveTo(start.x, start.y);
        graphics.lineTo(end.x, end.y);
      }
      graphics.stroke({ color: 'green' });
    });
  }

  const result = [];

  if (!Array.isArray(bodies)) {
    for (let j = 0; j < bodies.parts.length; j++) {
      const part = bodies.parts[j];

      let collision = collides(rayCollider, part);

      if (collision) {
        result.push({
          colliderBody: bodies,
          collider: part,
          overlap: collision.overlap,
          axis: collision.axis,
        });

        if (stopOnFirst) {
          return result;
        }
      }
    }

    return result;
  }

  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];

    for (let j = 0; j < body.parts.length; j++) {
      const part = body.parts[j];

      let collision = collides(rayCollider, part);

      if (collision) {
        result.push({
          colliderBody: body,
          collider: part,
          overlap: collision.overlap,
          axis: collision.axis,
        });

        if (stopOnFirst) {
          return result;
        }
      }
    }
  }

  return result;
}

export function castShape(
  bodies: SchemaToType<typeof ColliderBody>[] | SchemaToType<typeof ColliderBody>,
  shape: Vertices2,
  end: Vector2,
  opts: {
    stopOnFirst?: boolean;
  } = {}
): CastingResult[] {
  const stopOnFirst = opts.stopOnFirst ?? false;

  // if (DEBUG.isActive) {
  //   globalDebugGraphicsDeferred.push((graphics) => {
  //     for (let i = 0; i < rayCollider._vertices.length; i++) {
  //       const start = rayCollider._vertices[i];
  //       const end = rayCollider._vertices[(i + 1) % rayCollider._vertices.length];

  //       graphics.moveTo(start.x, start.y);
  //       graphics.lineTo(end.x, end.y);
  //     }
  //     graphics.stroke({ color: 'green' });
  //   });
  // }

  const result: CastingResult[] = [];

  // if (!Array.isArray(bodies)) {
  //   for (let j = 0; j < bodies.parts.length; j++) {
  //     const part = bodies.parts[j];

  //     let collision = collides(rayCollider, part);

  //     if (collision) {
  //       result.push({
  //         colliderBody: bodies,
  //         collider: part,
  //         overlap: collision.overlap,
  //         axis: collision.axis,
  //       });

  //       if (stopOnFirst) {
  //         return result;
  //       }
  //     }
  //   }

  // return result;
  // }

  // for (let i = 0; i < bodies.length; i++) {
  //   const body = bodies[i];

  //   for (let j = 0; j < body.parts.length; j++) {
  //     const part = body.parts[j];

  //     let collision = collides(rayCollider, part);

  //     if (collision) {
  //       result.push({
  //         colliderBody: body,
  //         collider: part,
  //         overlap: collision.overlap,
  //         axis: collision.axis,
  //       });

  //       if (stopOnFirst) {
  //         return result;
  //       }
  //     }
  //   }
  // }

  return result;
}

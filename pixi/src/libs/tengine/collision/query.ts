import { Entity, Query, SchemaToType, table } from 'libs/tecs';
import { Axis2, Vector2 } from '../core';
import { Collider, ColliderBody, rectangleColliderComponentSE } from './components';
import { collides } from './collision';
import { DEBUG, globalDebugGraphicsDeferred } from '../debug';
import { hasEntity } from 'libs/tecs/archetype';
import { colliderTranslation, translateCollider } from './collider-transform';

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
    globalDebugGraphicsDeferred.push((graphics, options) => {
      if (options.castings) {
        for (let i = 0; i < rayCollider._vertices.length; i++) {
          const start = rayCollider._vertices[i];
          const end = rayCollider._vertices[(i + 1) % rayCollider._vertices.length];

          graphics.moveTo(start.x, start.y);
          graphics.lineTo(end.x, end.y);
        }
        graphics.stroke({ color: 'green' });
      }
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

export const castRayByQuery = (
  query: Query<[typeof ColliderBody]>,
  start: Vector2,
  end: Vector2,
  opts: {
    width?: number;
    stopOnFirst?: boolean;
    notSelf?: Entity;
  } = {}
): CastingResult[] => {
  const results = [];

  for (let i = 0; i < query.archetypes.length; i++) {
    const archetype = query.archetypes[i];

    let colliderBodies = table(archetype, ColliderBody);

    if (opts.notSelf !== undefined) {
      const selfEntity = opts.notSelf;
      if (hasEntity(archetype, selfEntity)) {
        const entityIndex = archetype.entitiesSS.sparse[selfEntity];
        const colliderBodiesT = table(archetype, ColliderBody);
        colliderBodies = [];
        for (let i = 0; i < colliderBodiesT.length; i++) {
          if (i === entityIndex) {
            continue;
          }
          const colliderBody = colliderBodiesT[i];
          colliderBodies.push(colliderBody);
        }
      }
    }

    const result = castRay(colliderBodies, start, end, opts);

    if (result.length > 0) {
      results.push(...result);

      if (opts.stopOnFirst) {
        return results;
      }
    }
  }

  return results;
};

export function castShape(
  bodies: SchemaToType<typeof ColliderBody>[],
  shape: SchemaToType<typeof ColliderBody>,
  velocity: Vector2,
  opts: {
    stopOnFirst?: boolean;
  } = {}
): CastingResult[] {
  const stopOnFirst = opts.stopOnFirst ?? false;

  if (DEBUG.isActive) {
    globalDebugGraphicsDeferred.push((graphics, options) => {
      if (options.castings) {
        for (const collider of shape.parts) {
          for (let i = 0; i < collider._vertices.length; i++) {
            const start = collider._vertices[i];
            const end = collider._vertices[(i + 1) % collider._vertices.length];

            graphics.moveTo(start.x, start.y);
            graphics.lineTo(end.x, end.y);
          }
        }
        graphics.stroke({ color: 'green' });
      }
    });
  }

  const result = [];

  for (let i = 0; i < shape.parts.length; i++) {
    const shapeCollider = shape.parts[i];
    const translation = colliderTranslation(shapeCollider, velocity);
    const shapeColliderTranslated = {
      ...shapeCollider,
      _position: translation._position,
      _vertices: translation._vertices,
    };

    for (let i = 0; i < bodies.length; i++) {
      const otherBody = bodies[i];

      for (let j = 0; j < otherBody.parts.length; j++) {
        const otherCollider = otherBody.parts[j];

        let collision = collides(shapeColliderTranslated, otherCollider);

        if (collision) {
          result.push({
            colliderBody: otherBody,
            collider: otherCollider,
            overlap: collision.overlap,
            axis: collision.axis,
          });

          if (stopOnFirst) {
            return result;
          }
        }
      }
    }
  }

  return result;
}

export const castShapeByQuery = (
  query: Query<[typeof ColliderBody]>,
  shape: SchemaToType<typeof ColliderBody>,
  velocity: Vector2,
  opts: {
    stopOnFirst?: boolean;
    notSelf?: Entity;
  } = {}
): CastingResult[] => {
  const results = [];

  for (let i = 0; i < query.archetypes.length; i++) {
    const archetype = query.archetypes[i];

    let colliderBodies = table(archetype, ColliderBody);

    if (opts.notSelf !== undefined) {
      const selfEntity = opts.notSelf;
      if (hasEntity(archetype, selfEntity)) {
        const entityIndex = archetype.entitiesSS.sparse[selfEntity];
        const colliderBodiesT = table(archetype, ColliderBody);
        colliderBodies = [];
        for (let i = 0; i < colliderBodiesT.length; i++) {
          if (i === entityIndex) {
            continue;
          }
          const colliderBody = colliderBodiesT[i];
          colliderBodies.push(colliderBody);
        }
      }
    }

    const result = castShape(colliderBodies, shape, velocity, opts);

    if (result.length > 0) {
      results.push(...result);

      if (opts.stopOnFirst) {
        return results;
      }
    }
  }

  return results;
};

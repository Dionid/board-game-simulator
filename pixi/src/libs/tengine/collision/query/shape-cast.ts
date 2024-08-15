import { Entity, hasEntity, Query, SchemaToType, table } from 'libs/tecs';
import { Axis2, Vector2 } from '../../core';
import { Collider, ColliderBody } from '.././components';
import { collides } from '.././collision';
import { DEBUG, globalDebugGraphicsDeferred } from '../../debug';
import { colliderTranslation } from '.././collider-transform';

export type CastingResult = {
  colliderBody: SchemaToType<typeof ColliderBody>;
  collider: SchemaToType<typeof Collider>;
  overlap: number;
  axis: Axis2;
};

export function castShape(
  bodies: SchemaToType<typeof ColliderBody>[],
  shape: SchemaToType<typeof Collider>[],
  translation: Vector2,
  opts: {
    stopOnFirst?: boolean;
  } = {}
): CastingResult[] {
  const stopOnFirst = opts.stopOnFirst ?? false;

  if (DEBUG.isActive) {
    globalDebugGraphicsDeferred.push((graphics, options) => {
      if (options.castings) {
        for (const collider of shape) {
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

  for (let i = 0; i < shape.length; i++) {
    const shapeCollider = shape[i];
    const newTranslation = colliderTranslation(shapeCollider, translation);
    const shapeColliderTranslated = {
      ...shapeCollider,
      _position: newTranslation._position,
      _vertices: newTranslation._vertices,
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
  shape: SchemaToType<typeof Collider>[],
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

    // TODO: improve this
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

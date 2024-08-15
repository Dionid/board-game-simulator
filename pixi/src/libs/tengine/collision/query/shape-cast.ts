import { Entity, hasEntity, Query, SchemaToType, table } from 'libs/tecs';
import { Axis2, scaleV2, translateV2, unitV2, Vector2 } from '../../core';
import { Collider, ColliderBody } from '.././components';
import { collides } from '.././collision';
import { DEBUG, globalDebugGraphicsDeferred } from '../../debug';
import { colliderTranslation } from '.././collider-transform';

export type CastingResult = {
  colliderBody: SchemaToType<typeof ColliderBody>;
  collider: SchemaToType<typeof Collider>;
  overlap: number;
  axis: Axis2;
  toi: number;
};

export function castShape(
  bodies: SchemaToType<typeof ColliderBody>[],
  shape: SchemaToType<typeof Collider>[],
  linearVelocity: Vector2,
  opts: {
    maxToi?: number;
    onlySolid?: boolean;
    filterBody?: (body: SchemaToType<typeof ColliderBody>) => boolean;
    filterCollider?: (body: SchemaToType<typeof Collider>) => boolean;
  } = {}
): CastingResult[] {
  const result: CastingResult[] = [];

  const maxToi = opts.maxToi ?? 10;

  if (DEBUG.isActive) {
    globalDebugGraphicsDeferred.push((graphics, options) => {
      if (options.castings) {
        for (let toi = 1; toi < maxToi + 1; toi++) {
          for (const collider of shape) {
            for (let i = 0; i < collider._vertices.length; i++) {
              const start = translateV2(
                collider._vertices[i],
                linearVelocity.x * toi,
                linearVelocity.y * toi
              );
              const end = translateV2(
                collider._vertices[(i + 1) % collider._vertices.length],
                linearVelocity.x * toi,
                linearVelocity.y * toi
              );

              graphics.moveTo(start.x, start.y);
              graphics.lineTo(end.x, end.y);
            }
          }
        }
        graphics.stroke({ color: 'green' });
      }
    });
  }

  for (let toi = 1; toi < maxToi + 1; toi++) {
    for (let i = 0; i < shape.length; i++) {
      const shapeCollider = shape[i];
      const newTranslation = colliderTranslation(shapeCollider, scaleV2(linearVelocity, toi));
      const shapeColliderTranslated = {
        ...shapeCollider,
        _position: newTranslation._position,
        _vertices: newTranslation._vertices,
      };

      for (let i = 0; i < bodies.length; i++) {
        const otherBody = bodies[i];

        if (opts.filterBody && !opts.filterBody(otherBody)) {
          continue;
        }

        for (let j = 0; j < otherBody.parts.length; j++) {
          const otherCollider = otherBody.parts[j];

          if (opts.onlySolid && otherCollider.type !== 'solid') {
            continue;
          }

          if (opts.filterCollider && !opts.filterCollider(otherCollider)) {
            continue;
          }

          let collision = collides(shapeColliderTranslated, otherCollider);

          if (collision) {
            result.push({
              colliderBody: otherBody,
              collider: otherCollider,
              overlap: collision.overlap,
              axis: collision.axis,
              toi,
            });
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
  linearVelocity: Vector2,
  opts: {
    notSelf?: Entity;
    maxToi?: number;
    onlySolid?: boolean;
    filterBody?: (body: SchemaToType<typeof ColliderBody>) => boolean;
    filterCollider?: (body: SchemaToType<typeof Collider>) => boolean;
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

    const result = castShape(colliderBodies, shape, linearVelocity, opts);

    if (result.length > 0) {
      results.push(...result);
    }
  }

  return results;
};

import { Entity, hasEntity, Query, SchemaToType, table } from 'libs/tecs';
import { ColliderBody, Collider } from '../components';
import { collides } from '../collision';
import { Axis2 } from 'libs/tengine/core';

export type IntersectionResult = {
  colliderBody: SchemaToType<typeof ColliderBody>;
  collider: SchemaToType<typeof Collider>;
  overlap: number;
  axis: Axis2;
};

export const shapeIntersection = (
  colliderBodies: SchemaToType<typeof ColliderBody>[],
  shape: SchemaToType<typeof Collider>[],
  opts: {
    stopOnFirst?: boolean;
    notSelf?: Entity;
  } = {}
): IntersectionResult[] => {
  const results = [];

  for (let i = 0; i < shape.length; i++) {
    const shapeCollider = shape[i];

    for (let i = 0; i < colliderBodies.length; i++) {
      const otherBody = colliderBodies[i];

      for (let j = 0; j < otherBody.parts.length; j++) {
        const otherCollider = otherBody.parts[j];

        let collision = collides(shapeCollider, otherCollider);

        if (collision) {
          results.push({
            colliderBody: otherBody,
            collider: otherCollider,
            overlap: collision.overlap,
            axis: collision.axis,
          });

          if (opts.stopOnFirst) {
            return results;
          }
        }
      }
    }
  }

  return results;
};

export const shapeIntersectionByQuery = (
  query: Query<[typeof ColliderBody]>,
  shape: SchemaToType<typeof Collider>[],
  opts: {
    stopOnFirst?: boolean;
    notSelf?: Entity;
  } = {}
): IntersectionResult[] => {
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

    const result = shapeIntersection(colliderBodies, shape, opts);

    if (result.length > 0) {
      results.push(...result);

      if (opts.stopOnFirst) {
        return results;
      }
    }
  }

  return results;
};

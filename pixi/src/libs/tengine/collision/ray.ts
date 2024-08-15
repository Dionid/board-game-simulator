import { Entity, hasEntity, Query, SchemaToType, table } from 'libs/tecs';
import { Vector2, Vertices2 } from '../core';
import { Collider, ColliderBody } from './components';
import { DEBUG, globalDebugGraphicsDeferred } from '../debug';

export type Ray = {
  origin: Vector2;
  direction: Vector2;
};

// # This is from ChatGpt and I still don't understand it
// I will keep it to understand it later

// function intersectRayWithSegment(ray: Ray, p1: Vector2, p2: Vector2): boolean {
//   const v1 = subV2(ray.origin, p1);
//   const v2 = subV2(p2, p1);
//   const v3 = { x: -ray.direction.y, y: ray.direction.x };

//   const dotProduct = dotV2(v2, v3);
//   if (Math.abs(dotProduct) < 1e-6) {
//     return false; // Ray is parallel to the segment
//   }

//   const t1 = crossV2(v2, v1) / dotProduct;
//   const t2 = dotV2(v1, v3) / dotProduct;

//   return t1 >= 0 && t2 >= 0 && t2 <= 1;
// }

const eps = 1e-6;

export function raySegmentIntersectionPoint(
  ray: Ray,
  p1: Vector2,
  p2: Vector2,
  smallestR?: number
): (Vector2 & { r: number }) | null {
  const ror = ray.origin;
  const rdr = ray.direction;

  const denominator = rdr.x * (p2.y - p1.y) - (p2.x - p1.x) * rdr.y;
  if (denominator === 0) {
    return null;
  }

  const r = ((p2.x - p1.x) * (ror.y - p1.y) - (ror.x - p1.x) * (p2.y - p1.y)) / denominator;
  if (r + eps < 0) {
    return null;
  }

  if (smallestR !== undefined && smallestR < r) {
    return null;
  }

  const s = ((p1.x - ror.x) * rdr.y - rdr.x * (p1.y - ror.y)) / denominator;
  if (s + eps < 0 || s - eps > 1) {
    return null;
  }

  return {
    x: s * (p2.x - p1.x) + p1.x,
    y: s * (p2.y - p1.y) + p1.y,
    r,
  };
}

export function doesRayIntersectsPolygon(ray: Ray, vertices: Vertices2): boolean {
  for (let i = 0; i < vertices.length; i++) {
    const nextIndex = (i + 1) % vertices.length;
    const point = raySegmentIntersectionPoint(ray, vertices[i], vertices[nextIndex]);
    if (point) {
      return true;
    }
  }
  return false;
}

export function closestRaySegmentIntersectionPoint(
  ray: Ray,
  vertices: Vertices2
): (Vector2 & { r: number }) | null {
  let closest: (Vector2 & { r: number }) | null = null;
  for (let i = 0; i < vertices.length; i++) {
    const nextIndex = (i + 1) % vertices.length;
    const point = raySegmentIntersectionPoint(ray, vertices[i], vertices[nextIndex], closest?.r);
    if (point && (!closest || point.r < closest.r)) {
      closest = point;
    }
  }
  return closest;
}

export function rayVerticesIntersectionPoint(
  ray: Ray,
  vertices: Vertices2
): (Vector2 & { r: number })[] {
  const result = [];
  for (let i = 0; i < vertices.length; i++) {
    const nextIndex = (i + 1) % vertices.length;
    const point = raySegmentIntersectionPoint(ray, vertices[i], vertices[nextIndex]);
    if (point) {
      result.push(point);
    }
  }
  return result;
}

type CastingResult = {
  point: Vector2 & { r: number };
  body: SchemaToType<typeof ColliderBody>;
  collider: SchemaToType<typeof Collider>;
  bodyIndex: number;
  colliderIndex: number;
};

export function castRay(
  bodies: SchemaToType<typeof ColliderBody>[],
  ray: Ray,
  opts: {
    filterBody?: (body: SchemaToType<typeof ColliderBody>) => boolean;
    filterCollider?: (body: SchemaToType<typeof Collider>) => boolean;
  } = {}
): CastingResult[] {
  let result: CastingResult[] = [];

  if (DEBUG.isActive) {
    globalDebugGraphicsDeferred.push((graphics, options) => {
      if (options.castings) {
        graphics.moveTo(ray.origin.x, ray.origin.y);
        graphics.lineTo(
          ray.origin.x + ray.direction.x * 1000,
          ray.origin.y + ray.direction.x * 1000
        );
        graphics.stroke({ color: 'green' });
      }
    });
  }

  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];

    if (opts.filterBody && !opts.filterBody(body)) {
      continue;
    }

    for (let j = 0; j < body.parts.length; j++) {
      const collider = body.parts[j];

      // TODO: Add support for circle collision
      const vertices = collider._vertices;
      if (vertices.length < 2) {
        continue;
      }

      if (opts.filterCollider && !opts.filterCollider(collider)) {
        continue;
      }

      const point = closestRaySegmentIntersectionPoint(ray, vertices);
      if (point) {
        result.push({
          point,
          body,
          collider,
          bodyIndex: i,
          colliderIndex: j,
        });
      }
    }
  }

  return result;
}

// # Cast Ray take Closest

export function castRayClosest(
  bodies: SchemaToType<typeof ColliderBody>[],
  ray: Ray,
  opts: {
    filterBody?: (body: SchemaToType<typeof ColliderBody>) => boolean;
    filterCollider?: (body: SchemaToType<typeof Collider>) => boolean;
  } = {}
): CastingResult | null {
  let closest: CastingResult | null = null;

  if (DEBUG.isActive) {
    globalDebugGraphicsDeferred.push((graphics, options) => {
      if (options.castings) {
        graphics.moveTo(ray.origin.x, ray.origin.y);
        graphics.lineTo(
          ray.origin.x + ray.direction.x * 1000,
          ray.origin.y + ray.direction.y * 1000
        );
        graphics.stroke({ color: 'green' });
      }
    });
  }

  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];

    if (opts.filterBody && !opts.filterBody(body)) {
      continue;
    }

    for (let j = 0; j < body.parts.length; j++) {
      const collider = body.parts[j];

      // TODO: Add support for circle collision
      const vertices = collider._vertices;
      if (vertices.length < 2) {
        continue;
      }

      if (opts.filterCollider && !opts.filterCollider(collider)) {
        continue;
      }

      const point = closestRaySegmentIntersectionPoint(ray, vertices);
      if (point && (!closest || point.r < closest.point.r)) {
        closest = {
          point,
          body,
          collider,
          bodyIndex: i,
          colliderIndex: j,
        };
      }
    }
  }

  return closest;
}

export const castRayClosestByQuery = (
  query: Query<[typeof ColliderBody]>,
  ray: Ray,
  opts: {
    notSelf?: Entity;
    filterBody?: (body: SchemaToType<typeof ColliderBody>) => boolean;
    filterCollider?: (body: SchemaToType<typeof Collider>) => boolean;
  } = {}
): (CastingResult & { entity: Entity }) | null => {
  let closest: (CastingResult & { entity: Entity }) | null = null;

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

    const currentClosest = castRayClosest(colliderBodies, ray, opts);
    if (currentClosest && (!closest || currentClosest.point.r < closest.point.r)) {
      closest = {
        ...currentClosest,
        entity: archetype.entities[currentClosest.bodyIndex],
      };
    }
  }

  if (DEBUG.isActive && closest) {
    globalDebugGraphicsDeferred.push((graphics, options) => {
      if (options.castings && closest) {
        graphics.circle(closest.point.x, closest.point.y, 2);
        graphics.fill({ color: 'green' });
      }
    });
  }

  return closest;
};

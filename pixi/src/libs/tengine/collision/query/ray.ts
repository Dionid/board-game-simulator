import { Entity, hasEntity, Query, SchemaToType, table } from 'libs/tecs';
import { dotV2, subV2, Vector2, Vertices2 } from '../../core';
import { Collider, ColliderBody } from '../';
import { DEBUG, globalDebugGraphicsDeferred } from '../../debug';

export type Ray = {
  origin: Vector2;
  direction: Vector2;
};

// # This is from ChatGpt and I still don't understand it,
// will keep it to understand it later.

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
  smallestDistance?: number,
  maxDistance?: number
): (Vector2 & { distance: number }) | null {
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

  if (maxDistance !== undefined && r - eps > maxDistance) {
    return null;
  }

  if (smallestDistance !== undefined && smallestDistance < r) {
    return null;
  }

  const s = ((p1.x - ror.x) * rdr.y - rdr.x * (p1.y - ror.y)) / denominator;
  if (s + eps < 0 || s - eps > 1) {
    return null;
  }

  return {
    x: s * (p2.x - p1.x) + p1.x,
    y: s * (p2.y - p1.y) + p1.y,
    distance: r,
  };
}

export function rayCircleIntersectionPoint(
  ray: Ray,
  center: Vector2,
  radius: number
): (Vector2 & { distance: number }) | null {
  // i = origin + direction * t
  // r = Math.sqrt((i - center) ** 2)

  // r**2 = (i - center) ** 2
  // r**2 = (origin + direction * t - center) ** 2
  // r**2 = ((origin - center) + direction * t) ** 2
  // r**2 = (origin - center) ** 2 + 2 * (origin - center) * direction * t + (direction * t) ** 2
  // 0 = direction ** 2 * t ** 2 + 2 * (origin - center) * direction * t + (origin - center) ** 2 - r ** 2

  // oc = origin - center
  // a = direction * direction
  // b = 2 * oc * direction
  // c = oc * oc - r * r

  // t = (-b +- sqrt(b ** 2 - 4 * a * c)) / 2 * a

  // --- remove constant 2 & a === 1 ---

  // oc = origin - center
  // b = oc * direction
  // c = oc * oc - r * r
  // t = -b - sqrt(b ** 2 - c)

  const oc = subV2(ray.origin, center);
  const b = dotV2(oc, ray.direction);
  const c = dotV2(oc, oc) - radius * radius;

  const discriminant = b * b - c;

  if (discriminant < 0) {
    return null;
  }

  const t = -b - Math.sqrt(discriminant);

  return {
    x: ray.origin.x + ray.direction.x * t,
    y: ray.origin.y + ray.direction.y * t,
    distance: t,
  };
}

export function doesRayIntersectsPolygon(
  ray: Ray,
  vertices: Vertices2,
  maxDistance?: number
): boolean {
  for (let i = 0; i < vertices.length; i++) {
    const nextIndex = (i + 1) % vertices.length;
    const point = raySegmentIntersectionPoint(
      ray,
      vertices[i],
      vertices[nextIndex],
      undefined,
      maxDistance
    );
    if (point) {
      return true;
    }
  }
  return false;
}

export function closestRaySegmentIntersectionPoint(
  ray: Ray,
  vertices: Vertices2,
  maxDistance?: number
): (Vector2 & { distance: number }) | null {
  let closest: (Vector2 & { distance: number }) | null = null;
  for (let i = 0; i < vertices.length; i++) {
    const nextIndex = (i + 1) % vertices.length;
    const point = raySegmentIntersectionPoint(
      ray,
      vertices[i],
      vertices[nextIndex],
      closest?.distance,
      maxDistance
    );
    if (point && (!closest || point.distance < closest.distance)) {
      closest = point;
    }
  }
  return closest;
}

export function closestRayCircleIntersectionPoint(
  ray: Ray,
  vertices: Vertices2,
  maxDistance?: number
): (Vector2 & { distance: number }) | null {
  let closest: (Vector2 & { distance: number }) | null = null;
  for (let i = 0; i < vertices.length; i++) {
    const nextIndex = (i + 1) % vertices.length;
    const point = raySegmentIntersectionPoint(
      ray,
      vertices[i],
      vertices[nextIndex],
      closest?.distance,
      maxDistance
    );
    if (point && (!closest || point.distance < closest.distance)) {
      closest = point;
    }
  }
  return closest;
}

type CastingResult = {
  point: Vector2 & { distance: number };
  body: SchemaToType<typeof ColliderBody>;
  collider: SchemaToType<typeof Collider>;
  bodyIndex: number;
  colliderIndex: number;
};

// # Cast Ray take Closest

export function castRayClosest(
  bodies: SchemaToType<typeof ColliderBody>[],
  ray: Ray,
  opts: {
    maxDistance?: number;
    onlySolid?: boolean;
    filterBody?: (body: SchemaToType<typeof ColliderBody>) => boolean;
    filterCollider?: (body: SchemaToType<typeof Collider>) => boolean;
  } = {}
): CastingResult | null {
  let closest: CastingResult | null = null;

  if (DEBUG.isActive) {
    globalDebugGraphicsDeferred.push((graphics, options) => {
      if (options.castings) {
        graphics.moveTo(ray.origin.x, ray.origin.y);
        const maxDistance = opts.maxDistance ?? 1000;
        graphics.lineTo(
          ray.origin.x + ray.direction.x * maxDistance,
          ray.origin.y + ray.direction.y * maxDistance
        );
        graphics.stroke({ color: 'green' });
      }
    });
  }

  for (let i = 0; i < bodies.length; i++) {
    const otherBody = bodies[i];

    if (opts.filterBody && !opts.filterBody(otherBody)) {
      continue;
    }

    for (let j = 0; j < otherBody.parts.length; j++) {
      const otherCollider = otherBody.parts[j];

      if (opts.filterCollider && !opts.filterCollider(otherCollider)) {
        continue;
      }

      if (opts.onlySolid && otherCollider.type !== 'solid') {
        continue;
      }

      if (otherCollider.shape.type === 'circle') {
        const point = rayCircleIntersectionPoint(
          ray,
          otherCollider._position,
          otherCollider.shape.radius
        );
        if (point && (!closest || point.distance < closest.point.distance)) {
          closest = {
            point,
            body: otherBody,
            collider: otherCollider,
            bodyIndex: i,
            colliderIndex: j,
          };
        }
        continue;
      }

      // TODO: Add support for circle collision
      const vertices = otherCollider._vertices;
      if (vertices.length < 2) {
        continue;
      }

      const point = closestRaySegmentIntersectionPoint(ray, vertices, opts.maxDistance);
      if (point && (!closest || point.distance < closest.point.distance)) {
        closest = {
          point,
          body: otherBody,
          collider: otherCollider,
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
    maxDistance?: number;
    onlySolid?: boolean;
    filterBody?: (body: SchemaToType<typeof ColliderBody>) => boolean;
    filterCollider?: (body: SchemaToType<typeof Collider>) => boolean;
  } = {}
): (CastingResult & { entity: Entity }) | null => {
  let closest: (CastingResult & { entity: Entity }) | null = null;

  for (let i = 0; i < query.archetypes.length; i++) {
    const archetype = query.archetypes[i];

    let colliderBodies = table(archetype, ColliderBody);

    // TODO: Find more efficient way to filter out notSelf entity
    if (opts.notSelf !== undefined) {
      const selfEntity = opts.notSelf;
      if (hasEntity(archetype, selfEntity)) {
        const entityIndex = archetype.entitiesSS.sparse[selfEntity];
        const colliderBodiesT = table(archetype, ColliderBody);
        // # Empty colliderBodies and filter out notSelf entity
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
    if (currentClosest && (!closest || currentClosest.point.distance < closest.point.distance)) {
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

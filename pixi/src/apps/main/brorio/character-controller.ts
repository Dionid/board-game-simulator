import { Query } from 'libs/tecs';
import { CastingResult, castRayByQuery, ColliderBody } from 'libs/tengine/collision';
import { Vector2 } from 'libs/tengine/core';

export function castShapeAndTakeSolidMaxOverlap(
  query: Query<[typeof ColliderBody]>,
  start: Vector2,
  end: Vector2,
  opts: {
    width?: number;
    stopOnFirst?: boolean;
  } = {}
): [0, null, CastingResult[]] | [number, CastingResult, CastingResult[]] {
  const collisionsList = castRayByQuery(query, start, end, opts);

  let maxOverlap = 0;
  let maxOverlapCollision = null;

  for (const collision of collisionsList) {
    if (collision.collider.type !== 'solid') {
      continue;
    }
    if (collision.overlap > maxOverlap) {
      maxOverlap = collision.overlap;
      maxOverlapCollision = collision;
    }
  }

  if (maxOverlap === 0 || maxOverlapCollision === null) {
    return [0, null, collisionsList];
  }

  return [maxOverlap, maxOverlapCollision, collisionsList];
}

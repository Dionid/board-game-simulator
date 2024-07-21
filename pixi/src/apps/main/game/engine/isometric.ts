import { Vector2 } from '.';

export function cartisianToIso(vector: Vector2): Vector2 {
  return {
    x: vector.x - vector.y,
    y: (vector.x + vector.y) / 2,
  };
}

export function isoToCartisian(vector: Vector2): Vector2 {
  return {
    x: (2 * vector.y + vector.x) / 2,
    y: (2 * vector.y - vector.x) / 2,
  };
}

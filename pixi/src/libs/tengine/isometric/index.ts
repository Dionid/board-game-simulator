import { Size2, TablePosition, Vector2 } from '../core';

// export function cartesianToIso(vector: Vector2): Vector2 {
//   return {
//     x: vector.x - vector.y,
//     y: (vector.x + vector.y) / 2,
//   };
// }

// export function isoToCartisian(vector: Vector2): Vector2 {
//   return {
//     x: (2 * vector.y + vector.x) / 2,
//     y: (2 * vector.y - vector.x) / 2,
//   };
// }

export function tileCartesianPosition(tp: TablePosition, tileSize: Size2): Vector2 {
  return {
    x: (tp.col * tileSize.width) / 2 - (tp.row * tileSize.width) / 2,
    y: (tp.row * tileSize.height) / 2 + (tp.col * tileSize.height) / 2,
  };
}

export function cartesianTileRowCol(position: Vector2, tileSize: Size2): TablePosition {
  return {
    col: Math.floor(position.x / tileSize.width + position.y / tileSize.height - 0.5),
    row: Math.floor(position.y / tileSize.height - position.x / tileSize.width + 0.5),
  };
}

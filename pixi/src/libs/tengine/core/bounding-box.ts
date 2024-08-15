import { Vector2 } from './math';
import { Vertices2 } from './vertices';

export type BoundingBox2 = {
  min: Vector2;
  max: Vector2;
};

export function bb2FromVert2(vertices: Vertices2): BoundingBox2 {
  let minX = vertices[0].x;
  let minY = vertices[0].y;
  let maxX = vertices[0].x;
  let maxY = vertices[0].y;

  for (let i = 1; i < vertices.length; i++) {
    const vertex = vertices[i];
    if (vertex.x < minX) {
      minX = vertex.x;
    }
    if (vertex.x > maxX) {
      maxX = vertex.x;
    }
    if (vertex.y < minY) {
      minY = vertex.y;
    }
    if (vertex.y > maxY) {
      maxY = vertex.y;
    }
  }

  return {
    min: { x: minX, y: minY },
    max: { x: maxX, y: maxY },
  };
}

export function bb2FromVert2List(vertices: Vertices2[]): BoundingBox2 {
  let minX = vertices[0][0].x;
  let minY = vertices[0][0].y;
  let maxX = vertices[0][0].x;
  let maxY = vertices[0][0].y;

  for (let i = 0; i < vertices.length; i++) {
    for (let j = 0; j < vertices[i].length; j++) {
      const vertex = vertices[i][j];
      if (vertex.x < minX) {
        minX = vertex.x;
      }
      if (vertex.x > maxX) {
        maxX = vertex.x;
      }
      if (vertex.y < minY) {
        minY = vertex.y;
      }
      if (vertex.y > maxY) {
        maxY = vertex.y;
      }
    }
  }

  return {
    min: { x: minX, y: minY },
    max: { x: maxX, y: maxY },
  };
}

import { arrayOf, newSchema, number } from 'libs/tecs';
import { Vector2 } from './math';

export type Vertex2 = Vector2;

export const Vertex2 = newSchema({
  x: number,
  y: number,
});

export const translateVrx2 = (vertex: Vertex2, x: number, y: number): Vertex2 => {
  return {
    x: vertex.x + x,
    y: vertex.y + y,
  };
};

export const mutTranslateVrx2 = (vertex: Vertex2, x: number, y: number): void => {
  vertex.x += x;
  vertex.y += y;
};

export type Vertices = Vertex2[];

export const Vertices = arrayOf(Vertex2);

export const translateVertices2 = (vertices: Vertices, x: number, y: number): Vertices => {
  const result = [];

  for (const vertex of vertices) {
    result.push(translateVrx2(vertex, x, y));
  }

  return result;
};

export const mutTranslateVertices2 = (vertices: Vertices, x: number, y: number): void => {
  for (const vertex of vertices) {
    mutTranslateVrx2(vertex, x, y);
  }
};

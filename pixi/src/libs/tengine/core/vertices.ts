import { arrayOf } from 'libs/tecs';
import {
  mutRotateVrx2,
  mutRotateVrx2Around,
  mutTranslateVrx2,
  rotateVrx2,
  rotateVrx2Around,
  translateVrx2,
  Vertex2,
} from './vertex';
import { Position2 } from './types';

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

export function rotateVertices2(vertices: Vertices, angle: number): Vertices {
  const result = [];

  for (const vertex of vertices) {
    result.push(rotateVrx2(vertex, angle));
  }

  return result;
}

export function mutRotateVertices2(vertices: Vertices, angle: number): void {
  for (const vertex of vertices) {
    mutRotateVrx2(vertex, angle);
  }
}

export function rotateVertices2Around(
  vertices: Vertices,
  angle: number,
  center: Position2
): Vertices {
  const result = [];

  for (let i = 0; i < vertices.length; i++) {
    result.push(rotateVrx2Around(vertices[i], angle, center));
  }

  return result;
}

export function mutRotateVertices2Around(
  vertices: Vertices,
  angle: number,
  center: Position2
): void {
  for (let i = 0; i < vertices.length; i++) {
    mutRotateVrx2Around(vertices[i], angle, center);
  }
}

import { newSchema, number } from 'libs/tecs';
import { Vector2 } from './math';
import { Position2 } from './types';

export type Vertex2 = Vector2;

export const Vertex2 = newSchema({
  x: number,
  y: number,
});

export function translateVrx2(vertex: Vertex2, x: number, y: number): Vertex2 {
  return {
    x: vertex.x + x,
    y: vertex.y + y,
  };
}

export function mutTranslateVrx2(vertex: Vertex2, x: number, y: number): void {
  vertex.x += x;
  vertex.y += y;
}

export function rotateVrx2(vertex: Vertex2, angle: number): Vertex2 {
  return {
    x: vertex.x * Math.cos(angle) - vertex.y * Math.sin(angle),
    y: vertex.x * Math.sin(angle) + vertex.y * Math.cos(angle),
  };
}

export function mutRotateVrx2(vertex: Vertex2, angle: number): void {
  const x = vertex.x;
  vertex.x = x * Math.cos(angle) - vertex.y * Math.sin(angle);
  vertex.y = x * Math.sin(angle) + vertex.y * Math.cos(angle);
}

export function rotateVrx2Around(vertex: Vertex2, angle: number, center: Position2): Vertex2 {
  const x = vertex.x - center.x;
  const y = vertex.y - center.y;
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle) + center.x,
    y: x * Math.sin(angle) + y * Math.cos(angle) + center.y,
  };
}

export function mutRotateVrx2Around(vertex: Vertex2, angle: number, center: Position2): void {
  const x = vertex.x - center.x;
  const y = vertex.y - center.y;
  vertex.x = x * Math.cos(angle) - y * Math.sin(angle) + center.x;
  vertex.y = x * Math.sin(angle) + y * Math.cos(angle) + center.y;
}

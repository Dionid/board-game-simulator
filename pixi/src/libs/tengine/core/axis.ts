import { arrayOf, newSchema, number } from 'libs/tecs';
import { normalV2, subV2, unitV2, Vector2 } from './math';
import { Vertices2 } from './vertices';

export type Axis2 = Vector2;

export const Axis2 = newSchema({
  x: number,
  y: number,
});

export type Axes2 = Axis2[];

export const Axes2 = arrayOf(Axis2);

export function normalAxes2(vertices: Vertices2): Axes2 {
  const axes: Vector2[] = [];

  for (let i = 0; i < vertices.length; i += 1) {
    const j = i + 1 === vertices.length ? 0 : i + 1;
    const p1 = vertices[i];
    const p2 = vertices[j];

    const edge = subV2(p1, p2);
    axes.push(normalV2(unitV2(edge)));
  }

  return axes;
}

export function rotateAxes2(axes: Axes2, angle: number): Axes2 {
  if (angle === 0) {
    return axes;
  }

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const result = [];

  for (let i = 0; i < axes.length; i += 1) {
    const axis = axes[i];

    result.push({
      x: axis.x * cos - axis.y * sin,
      y: axis.x * sin + axis.y * cos,
    });
  }

  return result;
}

export function mutRotateAxes2(axes: Axes2, angle: number): void {
  if (angle === 0) {
    return;
  }

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  for (let i = 0; i < axes.length; i += 1) {
    const axis = axes[i];

    const px = axis.x * cos - axis.y * sin;
    axis.y = axis.x * sin + axis.y * cos;
    axis.x = px;
  }
}

export const constantRectangleNormalAxes2: Axes2 = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
];

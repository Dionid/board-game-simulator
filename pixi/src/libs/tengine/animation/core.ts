import { literal, union } from 'libs/tecs';

export const easeIn = literal('easeIn');

export function applyEaseIn(
  time: number,
  position: number,
  positionDelta: number,
  duration: number
): number {
  time /= duration;
  return positionDelta * time * time + position;
}

export const easeOut = literal('easeOut');

export const easing = union(easeIn, easeOut);

import { newSchema, number } from 'libs/tecs';
import {
  mutRotateV2,
  mutRotateV2Around,
  mutTranslateV2,
  rotateV2,
  rotateV2Around,
  translateV2,
  Vector2,
} from './math';
import { Position2 } from './types';

export type Vertex2 = Vector2;

export const Vertex2 = newSchema({
  x: number,
  y: number,
});

export const translateVrx2 = translateV2;
export const mutTranslateVrx2 = mutTranslateV2;
export const rotateVrx2 = rotateV2;
export const mutRotateVrx2 = mutRotateV2;
export const rotateVrx2Around = rotateV2Around;
export const mutRotateVrx2Around = mutRotateV2Around;

import { World } from './world';

export type Internals = {
  readonly worlds: World<any>[];
  currentWorldId: number;
  worldIds: number;
};

export const UNSAFE_internals: Internals = {
  worlds: [],
  currentWorldId: -1,
  worldIds: 0,
};

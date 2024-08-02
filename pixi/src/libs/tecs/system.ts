import { Essence } from './essence';

export type Stage = 'onFirstStep' | 'preUpdate' | 'update' | 'postUpdate';

export type Context = {
  stage: Stage;
  deltaTime: number;
  deltaMs: number;
  speed: number;
  essence: Essence;
};

export type System = (ctx: Context) => void;

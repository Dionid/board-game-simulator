import { Essence } from './essence';

export type Stage = 'onFirstStep' | 'preUpdate' | 'update' | 'postUpdate';

export type Context = {
  stage: Stage;
  deltaTime: number;
  deltaFrameTime: number;
  essence: Essence;
};

export type System = (ctx: Context) => void;

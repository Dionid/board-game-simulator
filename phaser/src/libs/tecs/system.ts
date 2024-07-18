import { World } from './world';

export type Stage = 'onFirstStep' | 'preUpdate' | 'update' | 'postUpdate';

export type Context = {
  stage: Stage;
  deltaTime: number;
  deltaFrameTime: number;
  world: World;
};

export type System = (ctx: Context) => void;

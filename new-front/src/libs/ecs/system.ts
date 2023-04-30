import { Essence } from './essence';

export type SystemProps<Ctx extends Record<any, any> = Record<any, any>> = {
  essence: Essence<any, any>;
  timeDelta: number;
  ctx: Ctx;
};

export type System<Ctx extends Record<any, any> = Record<any, any>> = {
  preInit?: (props: SystemProps<Ctx>) => void;
  init?: (props: SystemProps<Ctx>) => void;
  run?: (props: SystemProps<Ctx>) => void;
  destroy?: (props: SystemProps<Ctx>) => void;
  postDestroy?: (props: SystemProps<Ctx>) => void;
};

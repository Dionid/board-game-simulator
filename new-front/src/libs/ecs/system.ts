import { Essence } from './essence';

export const $systemId = Symbol('ecs_system_id');

export type SystemProps<Ctx extends Record<any, any> = Record<any, any>> = {
  essence: Essence<any, any>;
  timeDelta: number;
  ctx: Ctx;
};

export type System<Ctx extends Record<any, any> = Record<any, any>> = {
  [$systemId]?: number;
  init?: (props: SystemProps<Ctx>) => void;
  run?: (props: SystemProps<Ctx>) => void;
  destroy?: (props: SystemProps<Ctx>) => void;
};

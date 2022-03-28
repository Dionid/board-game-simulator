import { World } from './world';
import { Component } from './component';

export type SystemProps<
  CR extends Record<string, Component<any, any>>,
  Ctx extends Record<any, any> = Record<any, any>
> = {
  world: World<CR>;
  timeDelta: number;
  ctx: Ctx;
};

export type System<CR extends Record<string, Component<any, any>>, Ctx extends Record<any, any> = Record<any, any>> = {
  preInit?: (props: SystemProps<CR, Ctx>) => Promise<void>;
  init?: (props: SystemProps<CR, Ctx>) => Promise<void>;
  run: (props: SystemProps<CR, Ctx>) => Promise<void>;
  destroy?: (props: SystemProps<CR, Ctx>) => Promise<void>;
  postDestroy?: (props: SystemProps<CR, Ctx>) => Promise<void>;
};

import { System } from './system';
import { World } from './world';
import { Component } from './component';

export type Ignitor<CR extends Record<string, Component<any, any>>, Ctx extends Record<any, any> = Record<any, any>> = {
  world: World<CR>;
  systems: System<CR, Ctx>[];
  ctx: Ctx;
};

export const Ignitor = {
  init: async <CR extends Record<string, Component<any, any>>, Ctx extends Record<any, any> = Record<any, any>>(
    ignitor: Ignitor<CR, Ctx>
  ): Promise<void> => {
    for (let i = 0; i < ignitor.systems.length; i++) {
      const system = ignitor.systems[i];
      if (system.init)
        await system.init({
          world: ignitor.world,
          ctx: ignitor.ctx,
          timeDelta: 0,
        });
    }
  },
  run: async <CR extends Record<string, Component<any, any>>, Ctx extends Record<any, any> = Record<any, any>>(
    ignitor: Ignitor<CR, Ctx>,
    timeDelta: number
  ): Promise<void> => {
    for (let i = 0; i < ignitor.systems.length; i++) {
      const system = ignitor.systems[i];
      await system.run({
        world: ignitor.world,
        ctx: ignitor.ctx,
        timeDelta,
      });
    }
  },
  addToCtx: <
    CR extends Record<string, Component<any, any>>,
    K extends keyof Ctx,
    Ctx extends Record<K, any> = Record<K, any>
  >(
    ignitor: Ignitor<CR, Ctx>,
    ctxName: K,
    dep: Ctx[K]
  ): void => {
    ignitor.ctx[ctxName] = dep;
  },
};

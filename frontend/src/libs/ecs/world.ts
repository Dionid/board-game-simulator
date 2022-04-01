import { System } from './system';
import { Essence } from './essence';
import { Component } from './component';

export type World<CR extends Record<string, Component<any, any>>, Ctx extends Record<any, any> = Record<any, any>> = {
  essence: Essence<CR>;
  systems: System<CR, Ctx>[];
  ctx: Ctx;
};

export const World = {
  init: async <CR extends Record<string, Component<any, any>>, Ctx extends Record<any, any> = Record<any, any>>(
    ignitor: World<CR, Ctx>
  ): Promise<void> => {
    for (let i = 0; i < ignitor.systems.length; i++) {
      const system = ignitor.systems[i];
      if (system.init) {
        await system.init({
          essence: ignitor.essence,
          ctx: ignitor.ctx,
          timeDelta: 0,
        });
      }
    }
  },
  run: async <CR extends Record<string, Component<any, any>>, Ctx extends Record<any, any> = Record<any, any>>(
    ignitor: World<CR, Ctx>,
    timeDelta: number
  ): Promise<void> => {
    for (let i = 0; i < ignitor.systems.length; i++) {
      const system = ignitor.systems[i];
      if (system.run) {
        await system.run({
          essence: ignitor.essence,
          ctx: ignitor.ctx,
          timeDelta,
        });
      }
    }
  },
  addToCtx: <
    CR extends Record<string, Component<any, any>>,
    K extends keyof Ctx,
    Ctx extends Record<K, any> = Record<K, any>
  >(
    ignitor: World<CR, Ctx>,
    ctxName: K,
    dep: Ctx[K]
  ): void => {
    ignitor.ctx[ctxName] = dep;
  },
};

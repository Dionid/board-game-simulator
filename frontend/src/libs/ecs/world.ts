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
    world: World<CR, Ctx>
  ): Promise<void> => {
    for (let i = 0; i < world.systems.length; i++) {
      const system = world.systems[i];
      if (system.init) {
        await system.init({
          essence: world.essence,
          ctx: world.ctx,
          timeDelta: 0,
        });
      }
    }
  },
  run: async <CR extends Record<string, Component<any, any>>, Ctx extends Record<any, any> = Record<any, any>>(
    world: World<CR, Ctx>,
    timeDelta: number
  ): Promise<void> => {
    for (let i = 0; i < world.systems.length; i++) {
      const system = world.systems[i];
      if (system.run) {
        await system.run({
          essence: world.essence,
          ctx: world.ctx,
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
    world: World<CR, Ctx>,
    ctxName: K,
    dep: Ctx[K]
  ): void => {
    world.ctx[ctxName] = dep;
  },
};

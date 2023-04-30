import { System } from './system';
import { Essence } from './essence';

export type World<Ctx extends Record<any, any> = Record<any, any>> = {
  essence: Essence<any, any>;
  systems: System<Ctx>[];
  ctx: Ctx;
};

export const World = {
  init: <Ctx extends Record<any, any> = Record<any, any>>(world: World<Ctx>): void => {
    for (let i = 0; i < world.systems.length; i++) {
      const system = world.systems[i];
      if (system.init) {
        system.init({
          essence: world.essence,
          ctx: world.ctx,
          timeDelta: 0,
        });
      }
    }
  },
  run: <Ctx extends Record<any, any> = Record<any, any>>(world: World<Ctx>, timeDelta: number): void => {
    Essence.movePendingToActive(world.essence);
    for (let i = 0; i < world.systems.length; i++) {
      const system = world.systems[i];
      if (system.run) {
        system.run({
          essence: world.essence,
          ctx: world.ctx,
          timeDelta,
        });
      }
    }
    Essence.clearEvents(world.essence);
  },
  addToCtx: <K extends keyof Ctx, Ctx extends Record<K, any> = Record<K, any>>(
    world: World<Ctx>,
    ctxName: K,
    dep: Ctx[K]
  ): void => {
    world.ctx[ctxName] = dep;
  },
};

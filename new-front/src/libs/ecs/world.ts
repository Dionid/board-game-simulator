import { $systemId, System } from './system';
import { Essence } from './essence';
import { UNSAFE_internals } from './internals';

// # Code

export type World<Ctx extends Record<any, any> | unknown> = {
  id: number;
  step: number;
  systemIds: number;
  latestSystemId: number;
  ctx: () => Ctx;
  essence: Essence<any, any>;
  systems: Array<System<Ctx>>;
};

export const World = {
  new: <Ctx extends Record<any, any>>(world: {
    essence: Essence<any, any>;
    ctx: () => Ctx;
    systems?: Array<System<Ctx>>;
    systemIds?: number;
    step?: number;
  }): World<Ctx> => {
    const systems = world.systems || [];
    let systemIds = world.systemIds || 0;

    for (let i = 0; i < systems.length; i++) {
      const system = systems[i];
      system[$systemId] = systemIds++;
    }

    const newWorld = {
      id: UNSAFE_internals.worlds.length,
      systemIds,
      step: world.step || 0,
      latestSystemId: -1,
      ctx: world.ctx,
      essence: world.essence,
      systems,
    };

    UNSAFE_internals.worlds.push(newWorld);

    return newWorld;
  },
  run: <Ctx extends Record<any, any> = Record<any, any>>(world: World<Ctx>, timeDelta: number): void => {
    let prevWorld = UNSAFE_internals.currentWorldId;
    UNSAFE_internals.currentWorldId = world.id;
    Essence.movePendingToActive(world.essence);
    for (let i = 0; i < world.systems.length; i++) {
      const system = world.systems[i];
      if (system.run) {
        world.latestSystemId = system[$systemId]!;
        system.run(world);
      }
    }
    Essence.clearEvents(world.essence);
    world.step++;
    UNSAFE_internals.currentWorldId = prevWorld;
  },
};

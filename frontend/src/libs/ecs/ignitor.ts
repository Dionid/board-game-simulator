import { System } from './system';
import { World } from './world';

export type Ignitor = {
  world: World;
  systems: System[];
};

export const Ignitor = {
  addSystem: (ignitor: Ignitor, system: System) => {
    ignitor.systems.push(system);
    return () => Ignitor.destroySystem(ignitor, system);
  },
  init: async (ignitor: Ignitor) => {
    for (let i = 0; i < ignitor.systems.length; i++) {
      const system = ignitor.systems[i];
      if (system.init) await system.init(ignitor.world);
    }
  },
  update: async (ignitor: Ignitor) => {
    for (let i = 0; i < ignitor.systems.length; i++) {
      await ignitor.systems[i].run(ignitor.world);
    }
  },
  destroySystem: async (ignitor: Ignitor, system: System) => {
    if (system.destroy) await system.destroy(ignitor.world);
    ignitor.systems = ignitor.systems.filter((sys) => sys !== system);
    if (system.postDestroy) await system.postDestroy(ignitor.world);
  },
};

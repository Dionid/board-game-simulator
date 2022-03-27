import { System } from './system';
import { World } from './world';

export type Ignitor<W extends World = World> = {
  world: W;
  systems: System[];
};

export const Ignitor = {
  run: async (ignitor: Ignitor): Promise<void> => {
    for (let i = 0; i < ignitor.systems.length; i++) {
      const system = ignitor.systems[i];
      await system.run(ignitor.world);
    }
  },
};

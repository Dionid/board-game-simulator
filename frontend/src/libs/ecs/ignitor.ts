import { System } from './system';
import { World } from './world';

export type Ignitor<W extends World = World> = {
  world: W;
  systems: System[];
};

export const Ignitor = {
  addSystem: (ignitor: Ignitor, system: System): Ignitor => {
    // return () => Ignitor.destroySystem(ignitor, system);
    return {
      world: ignitor.world,
      systems: [...ignitor.systems, system],
    };
  },
  update: async (ignitor: Ignitor): Promise<Ignitor> => {
    return {
      systems: ignitor.systems,
      world: await ignitor.systems.reduce(async (acc, cur) => {
        return cur.run(await acc);
      }, Promise.resolve(ignitor.world)),
    };
  },
};

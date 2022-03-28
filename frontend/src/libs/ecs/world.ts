import { Component, Pool } from './component';
import { EntityId } from './entity';

export type World<C extends Record<string, Component<any, any>> = Record<string, Component<any, any>>> = {
  pools: {
    [K in keyof C]?: Pool<C[K]>;
  };
};

export const World = {
  getPool: <CR extends Record<string, Component<any, any>>, K extends keyof CR>(
    world: World<CR>,
    poolName: K
  ): Pool<CR[K]> | undefined => {
    return world.pools[poolName];
  },

  addPool: (world: World, pool: Pool): void => {
    world.pools[pool.name] = pool;
  },

  getOrAddPool: <CR extends Record<string, Component<any, any>>, K extends keyof CR>(
    world: World<CR>,
    poolName: K
  ): Pool<CR[K]> => {
    const pool = world.pools[poolName];

    if (!pool) {
      const newPool = { name: poolName, data: {} };
      world.pools[poolName] = newPool;
      return newPool;
    }

    return pool;
  },

  filter: <CR extends Record<string, Component<any, any>>, K extends keyof CR>(
    world: World<CR>,
    componentNames: CR[K]['name'][]
  ): EntityId[] => {
    const entityIds: Record<EntityId, boolean> = {};

    for (let i = 0; i < componentNames.length; i++) {
      const compName = componentNames[i];
      const pool = world.pools[compName];
      if (!pool) {
        return [];
      }

      // debugger

      if (i === 0) {
        // TODO. Fix types
        const ids = Object.keys(pool.data) as EntityId[];
        for (let j = 0; j < ids.length; j++) {
          const id = ids[j];
          entityIds[id] = true;
        }
      } else {
        // TODO. Fix types
        const ids = Object.keys(entityIds) as EntityId[];
        for (let j = 0; j < ids.length; j++) {
          const id = ids[j];
          if (!pool.data[id]) {
            delete entityIds[id];
          }
        }
      }
    }

    return Object.keys(entityIds) as EntityId[];
  },
};

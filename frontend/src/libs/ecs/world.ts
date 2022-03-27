import { Component, ComponentsPool } from './component';

export type World<C extends Record<string, Component<any, any>> = Record<string, Component<any, any>>> = {
  pools: {
    [K in keyof C]?: ComponentsPool<C[K]>;
  };
};

export const World = {
  getPool: <C extends Component<any, any>>(
    world: World<Record<C['name'], C>>,
    poolName: C['name']
  ): ComponentsPool<C> | undefined => {
    return world.pools[poolName];
  },
  addPool: (world: World, pool: ComponentsPool): void => {
    world.pools[pool.name] = pool;
  },
  getOrAddPool: <C extends Component<any, any>>(
    world: World<Record<C['name'], C>>,
    poolName: C['name']
  ): ComponentsPool<C> => {
    const pool = World.getPool<C>(world, poolName);
    if (!pool) {
      const newPool = ComponentsPool.default(poolName);
      World.addPool(world, newPool);
      return newPool;
    }
    return pool;
  },
};

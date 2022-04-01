import { Component, Pool } from './component';
import { EntityId } from './entity';

export type Essence<C extends Record<string, Component<any, any>> = Record<string, Component<any, any>>> = {
  pools: {
    [K in keyof C]?: Pool<C[K]>;
  };
};

type EntityWithComponents = {
  id: EntityId;
  components: Component<any, any>[];
};

export const Essence = {
  getPool: <CR extends Record<string, Component<any, any>>, K extends keyof CR>(
    essence: Essence<CR>,
    poolName: K
  ): Pool<CR[K]> | undefined => {
    return essence.pools[poolName];
  },

  addPool: (essence: Essence, pool: Pool): void => {
    essence.pools[pool.name] = pool;
  },

  getOrAddPool: <CR extends Record<string, Component<any, any>>, K extends keyof CR>(
    essence: Essence<CR>,
    poolName: K
  ): Pool<CR[K]> => {
    const pool = essence.pools[poolName];

    if (!pool) {
      const newPool = { name: poolName, data: {} };
      essence.pools[poolName] = newPool;
      return newPool;
    }

    return pool;
  },

  filter: <CR extends Record<string, Component<any, any>>, K extends keyof CR>(
    essence: Essence<CR>,
    componentNames: CR[K]['name'][]
  ): EntityId[] => {
    const entityIds: Record<EntityId, boolean> = {};

    for (let i = 0; i < componentNames.length; i++) {
      const compName = componentNames[i];
      const pool = essence.pools[compName];
      if (!pool) {
        return [];
      }

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

  getEntity: <CR extends Record<string, Component<any, any>>>(
    essence: Essence<CR>,
    entityId: EntityId
  ): EntityWithComponents | undefined => {
    const res = Object.keys(essence.pools).reduce<EntityWithComponents>(
      (acc, poolName) => {
        const pool = essence.pools[poolName];
        if (!pool) {
          return acc;
        }

        const component = pool.data[entityId];

        if (component) {
          acc.components.push(component);
        }

        return acc;
      },
      { id: entityId, components: [] }
    );

    if (res.components.length === 0) {
      return undefined;
    } else {
      return res;
    }
  },

  destroyEntity: <CR extends Record<string, Component<any, any>>>(essence: Essence<CR>, entityId: EntityId): void => {
    Object.keys(essence.pools).forEach((poolName) => {
      const pool = essence.pools[poolName];
      if (!pool) {
        return;
      }

      const { [entityId]: omit, ...newData } = pool.data;
      pool.data = newData;
    });
  },
};

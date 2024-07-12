import { SparseSet } from '../tecs-aws';

export type SoAComponentPool<Data extends Record<string, any[]>> = {
  id: number;
  entities: SparseSet<number>;
  data: Data;
};

export type TagComponentPool = {
  id: number;
  entities: SparseSet<number>;
};

export type ComponentPool<Data extends Record<string, any[]> | undefined> = Data extends Record<string, any[]>
  ? SoAComponentPool<Data>
  : TagComponentPool;

export type Essence = {
  pools: ComponentPool<any>[];
};

export type World = {
  size: number;
  nextEntityId: number;
  nextComponentId: number;
  essence: Essence;
};

export const newWorld = (size: number = 10000): World => {
  return {
    size,
    nextEntityId: 0,
    nextComponentId: 0,
    essence: {
      pools: [],
    },
  };
};

// # Example

type Vector2 = {
  x: number[];
  y: number[];
};

const main = () => {
  const world = newWorld();

  const PositionPool: SoAComponentPool<Vector2> = {
    id: 1,
    entities: SparseSet.new(),
    data: {
      x: [],
      y: [],
    },
  };

  const VelocityPool: SoAComponentPool<Vector2> = {
    id: 2,
    entities: SparseSet.new(),
    data: {
      x: [],
      y: [],
    },
  };

  world.essence.pools[PositionPool.id] = PositionPool;
  world.essence.pools[VelocityPool.id] = VelocityPool;

  const moveSystem = (world: World) => {
    for (let posEntityId = 0; posEntityId < PositionPool.entities.dense.length; posEntityId++) {
      const entity = PositionPool.entities.dense[posEntityId];

      // # Check if entity has velocity
      if (!SparseSet.has(VelocityPool.entities, entity)) {
        continue;
      }

      const velocityEntId = VelocityPool.entities.sparse[entity];

      const velocityX = VelocityPool.data.x[velocityEntId];
      const velocityY = VelocityPool.data.y[velocityEntId];

      if (velocityX > 0 || velocityY > 0) {
        // # Entity moved
        PositionPool.data.x[posEntityId] += velocityX;
        PositionPool.data.y[posEntityId] += velocityY;

        VelocityPool.data.x[velocityEntId] -= 1;
        VelocityPool.data.y[velocityEntId] -= 1;
      }
    }
  };

  moveSystem(world);
};

main();

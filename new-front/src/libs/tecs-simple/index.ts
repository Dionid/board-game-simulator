import { SparseSet } from '../tecs-aws';

export type SoAComponentPool<Data extends Record<string, any[]>> = {
  id: number;
  entitiesSSet: SparseSet<number>;
  entities: number[];
  data: Data;
};

export type TagComponentPool = {
  id: number;
  entitiesSSet: SparseSet<number>;
  entities: number[];
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
    id: world.nextComponentId++,
    entitiesSSet: SparseSet.new(),
    entities: [],
    data: {
      x: [],
      y: [],
    },
  };

  const VelocityPool: SoAComponentPool<Vector2> = {
    id: world.nextComponentId++,
    entitiesSSet: SparseSet.new(),
    entities: [],
    data: {
      x: [],
      y: [],
    },
  };

  world.essence.pools.push(PositionPool);
  world.essence.pools.push(VelocityPool);

  const moveSystem = (world: World) => {
    for (let i = 0; i < PositionPool.entities.length; i++) {
      const entity = PositionPool.entities[i];

      // # Check if entity has velocity
      if (!SparseSet.has(VelocityPool.entitiesSSet, entity)) {
        continue;
      }

      const velocityEntityIndex = VelocityPool.entitiesSSet.sparse[entity];

      const velocityX = VelocityPool.data.x[velocityEntityIndex];
      const velocityY = VelocityPool.data.y[velocityEntityIndex];

      if (velocityX > 0 || velocityY > 0) {
        // # Entity moved
        PositionPool.data.x[i] += velocityX;
        PositionPool.data.y[i] += velocityY;

        VelocityPool.data.x[velocityEntityIndex] -= 1;
        VelocityPool.data.y[velocityEntityIndex] -= 1;
      }
    }
  };

  moveSystem(world);
};

main();

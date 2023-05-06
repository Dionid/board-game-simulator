// // Sparse Set

// type SparseSet<T> = {
//   sparse: (number | undefined)[];
//   dense: T[];
//   denseEntityIds: number[];
// };

// // # Has component
// const hasComponent = <T>(sparseSet: SparseSet<T>, entityId: number) => {
//   return sparseSet.sparse[entityId] !== undefined;
// };

// // # Find by entity – O(1)
// const findComponentDataByEntity = <T>(sparseSet: SparseSet<T>, entityId: number) => {
//   const entityIndex = sparseSet.sparse[entityId];
//   if (!entityIndex) {
//     return;
//   }
//   return sparseSet.dense[entityIndex];
// };

// const addComponentDataByEntity = <T>(sparseSet: SparseSet<T>, entityId: number, data: T) => {
//   sparseSet.sparse[entityId] = sparseSet.dense.push(data) - 1;
//   sparseSet.denseEntityIds.push(entityId);
// };

// const removeEntity = <T>(sparseSet: SparseSet<T>, entityId: number) => {
//   if (hasComponent(sparseSet, entityId)) {
//     const denseIndex = sparseSet.sparse[entityId]!;
//     sparseSet.sparse[entityId] = undefined;
//     const last = sparseSet.dense.pop()!;
//     sparseSet.dense[denseIndex] = last;
//   }
// };

/**
 * Sparse Set
 * 
 * Pros
 * 
 * - Fast find ny containing data (in array i must iterate over all elements, to find one)
 
const entityId = 5;

const entityArray = [3, 1, 2, 0, 5]

const entitySparseSet = {
    sparse: [3, 0, 0, 1, 4, 2],
    dense: [2, 1, 5],
}

const entityInArray = entityArray.some((entityIdInArray) => entityIdInArray === entityId)
const entityInSparseSet = entitySparseSet.dense[entitySparseSet.sparse[entityId]] === entityId

* - Still fast iterations

for (entityId of entitySparseSet.dense) {
    // ...
}

* - Fast remove

const entityId = 5;

const entityArray = [3, 1, 2, 0, 5]

const entitySparseSet = {
    sparse: [3, 1, 0, 1, 4, 2],
    dense: [2, 1, 5, 0],
}

const expectedEntitySparseSet = {
    sparse: [2, 1, 0, 1, 4, 2],
    dense: [2, 1, 0],
}

const entityInArray = entityArray.splice(entityArray.indexOf(entityId), 1)

if (entitySparseSet.dense[entitySparseSet.sparse[entityId]] === entityId) {
    const last = entitySparseSet.dense.pop()!;
    if (last !== entityId) {
        entitySparseSet.sparse[last] = entitySparseSet.sparse[x]
        entitySparseSet.dense[entitySparseSet.sparse[entityId]] = last;
    }
}

* – Fast add

const entityId = 5;
const newEntityId = 5;

const entityArray = [3, 1, 2, 0, 5]

const entitySparseSet = {
    sparse: [3, 1, 0, 1, 4, 2],
    dense: [2, 1, 5, 0],
}

entityInArray.push(newEntityId);
entitySparseSet.sparse[newEntityId] = entitySparseSet.dense.push(newEntityId) - 1;

*/

export type Entity = number;

type ComponentType = number;

type SparseSet = {
  sparse: number[];
  dense: number[];
};

const SparseSet = {
  has: (sSet: SparseSet, x: number) => {
    return sSet.dense[sSet.sparse[x]] === x;
  },
  add: (sSet: SparseSet, x: number) => {
    sSet.sparse[x] = sSet.dense.push(x) - 1;
  },
  remove: (sSet: SparseSet, x: number) => {
    const last = sSet.dense.pop()!;
    if (last !== x) {
      sSet.sparse[last] = sSet.sparse[x];
      sSet.dense[sSet.sparse[x]] = last;
    }
  },
};

type ArchetypeMask = ComponentType;

type Archetype = {
  mask: ArchetypeMask;
  entitySet: SparseSet;
  entities: Entity[];
  //   readonly adjacent: InternalArchetype[]
};

const Archetype = {
  new: (mask: ArchetypeMask): Archetype => {
    const dense: ArchetypeMask[] = [];

    return Object.freeze({
      entitySet: {
        sparse: [],
        dense,
      },
      entities: dense,
      mask,
    });
  },
  hasComponent: (arch: Archetype, componentType: ComponentType) => {
    return (arch.mask & componentType) === componentType;
  },
  hasEntity: (arch: Archetype, entity: Entity) => {
    return SparseSet.has(arch.entitySet, entity);
  },
  addEntity: (arch: Archetype, entity: Entity) => {
    return SparseSet.add(arch.entitySet, entity);
  },
  removeEntity: (arch: Archetype, entity: Entity) => {
    return SparseSet.remove(arch.entitySet, entity);
  },
};

const emptyArchetype = Archetype.new(0);

type World = {
  entityId: number;
  //   archetypes: Map<ArchetypeMask, Archetype>;

  archetypes: Archetype[];
  archetypesByMask: ArchetypeMask[];

  archetypesByEntities: Archetype[];
};

const getOrCreateArchetype = (world: World, mask: ArchetypeMask) => {
  let i = world.archetypesByMask.indexOf(mask);

  if (i === -1) {
    const newArchetype = Archetype.new(mask);
    i = world.archetypes.push(newArchetype) - 1;
  }

  return world.archetypes[i];
};

const World = {
  createEntity: (world: World) => {
    const id = world.entityId++;

    world.archetypesByEntities[id] = emptyArchetype;

    return id;
  },
  addComponent: (world: World, entity: Entity, componentType: ComponentType) => {
    const arch = world.archetypesByEntities[entity];

    // # If current entity archetype doesn't have this component,
    // then change archetype
    if ((arch.mask & componentType) !== componentType) {
      Archetype.removeEntity(arch, entity);
      const newArchetype = getOrCreateArchetype(world, arch.mask | componentType);
      Archetype.addEntity(newArchetype, entity);
      world.archetypesByEntities[entity] = newArchetype;
    }
  },
};

// enum Components {
//   Position,
//   Velocity,
// }

// const Has: Record<string, ArchetypeMask> = {
//   Position: 1 << Components.Position,
//   Velocity: 1 << Components.Velocity,
// };

// type Vector2Component = {
//   x: number[];
//   y: number[];
// };

// const PositionComponent: Vector2Component = {
//   x: [],
//   y: [],
// };

// const VelocityComponent: Vector2Component = {
//   x: [],
//   y: [],
// };

// const world: World = {
//   entityId: 0,
//   archetypes: new Map(),
//   archetypesByEntities: [],
// };

// const positionVelocityQuery = Has.Position | Has.Velocity;

// const moveSystem = () => {
//   return (world: World) => {
//     const entities = world.archetypes.get(positionVelocityQuery)?.entities;

//     if (!entities) {
//       return;
//     }

//     for (let archetypes of world.archetypesByEntities) {
//       if ((archetypes.mask & positionVelocityQuery) === positionVelocityQuery) {
//         for (const entity of archetypes.entities) {
//           PositionComponent.x[entity] += VelocityComponent.x[entity];
//           PositionComponent.y[entity] += VelocityComponent.y[entity];
//           VelocityComponent.x[entity] -= 1;
//           VelocityComponent.y[entity] -= 1;
//         }
//       }
//     }
//   };
// };

// console.log('world', world);
// console.log('PositionComponent', PositionComponent);
// console.log('VelocityComponent', VelocityComponent);

// moveSystem()(world);

// console.log('world', world);
// console.log('PositionComponent', PositionComponent);
// console.log('VelocityComponent', VelocityComponent);

// const entity = World.createEntity(world);
// World.addComponent(world, entity, Has.Position);
// PositionComponent.x[entity] = 1;
// PositionComponent.y[entity] = 1;
// World.addComponent(world, entity, Has.Velocity);
// VelocityComponent.x[entity] = 2;
// VelocityComponent.y[entity] = 2;

// console.log('world', world);
// console.log('PositionComponent', PositionComponent);
// console.log('VelocityComponent', VelocityComponent);

// moveSystem()(world);

// console.log('world', world);
// console.log('PositionComponent', PositionComponent);
// console.log('VelocityComponent', VelocityComponent);

// moveSystem()(world);

// console.log('world', world);
// console.log('PositionComponent', PositionComponent);
// console.log('VelocityComponent', VelocityComponent);

// console.log('world.archetypesByEntities[entity]', world.archetypesByEntities[entity]);

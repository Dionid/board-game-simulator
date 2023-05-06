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

// # Sparse Set

type SparseSet = {
  sparse: number[];
  dense: number[];
};

const SparseSet = {
  has: (sSet: SparseSet, x: number) => {
    return sSet.dense[sSet.sparse[x]] === x;
  },
  add: (sSet: SparseSet, value: number) => {
    if (
      value >= sSet.sparse.length ||
      sSet.sparse[value] === undefined ||
      sSet.sparse[value]! >= sSet.dense.length ||
      sSet.dense[sSet.sparse[value]!] !== value
    ) {
      sSet.sparse[value] = sSet.dense.length;
      sSet.dense.push(value);
    }
    // sSet.sparse[x] = sSet.dense.push(x) - 1;
  },
  remove: (sSet: SparseSet, value: number) => {
    if (sSet.dense[sSet.sparse[value]!] === value) {
      const swap = sSet.dense.pop()!;
      if (swap !== value) {
        sSet.dense[sSet.sparse[value]!] = swap;
        sSet.sparse[swap] = sSet.sparse[value]!;
      }
    }
  },
};

// # Entity

export type Entity = number;

// # Component

type ComponentType = number;
type ComponentId = number;

type Component = ComponentId | { readonly id: ComponentId };

// # Archetype

type ArchetypeMask = ComponentType;

type Archetype = {
  id: string;
  mask: ArchetypeMask;
  entitySet: SparseSet;
  entities: Entity[];
  readonly adjacent: Archetype[];
};

const Archetype = {
  new: (id: string, mask: ArchetypeMask): Archetype => {
    const dense: ArchetypeMask[] = [];

    return Object.freeze({
      id,
      entitySet: {
        sparse: [],
        dense,
      },
      entities: dense,
      mask,
      adjacent: [],
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
  transform: (archetype: Archetype, componentId: number): Archetype => {
    if (archetype.adjacent[componentId] !== undefined) {
      return archetype.adjacent[componentId]!;
    }

    // Mutate the current mask in order to avoid creating garbage (in case the archetype already exists)
    const mask = archetype.mask;
    // mask.xor(componentId);
    archetype.mask ^= componentId;
    const nextId = mask.toString();

    let existingArchetype: Archetype | null = null;
    Archetype.traverseGraph(archetype, (node) => {
      if (node === archetype) return;
      if (node.id === nextId) {
        existingArchetype = node;
        return false;
      }
      return existingArchetype === null;
    });

    const transformed = existingArchetype || Archetype.new(nextId, mask);
    // reset current mask of input archetype, see comment above
    // mask.xor(componentId);
    archetype.mask ^= componentId;
    transformed.adjacent[componentId] = archetype;
    archetype.adjacent[componentId] = transformed;
    return transformed;
  },
  traverseGraph: (
    archetype: Archetype,
    callback: (archetype: Archetype) => boolean | void,
    traversed = new Set<Archetype>()
  ): boolean => {
    traversed.add(archetype);
    if (callback(archetype) === false) return false;
    const adjacent = archetype.adjacent;
    for (let i = 0, l = adjacent.length; i < l; i++) {
      const arch = adjacent[i];
      // adjacent is sparse, so there can be empty slots
      if (arch === undefined) continue;
      // graph is doubly linked, so need to prevent infinite recursion
      if (traversed.has(arch)) continue;
      if (Archetype.traverseGraph(arch, callback, traversed) === false) return false;
    }
    return true;
  },
};

// # System

export type System = (world: World) => void;

// # World

const rootArchetype = Archetype.new('root', 0);

type World = {
  entityGraveyard: Entity[];
  nextEntityId: Entity;
  nextComponentId: number;
  rootArchetype: Archetype;
  archetypesByEntities: Archetype[];
  initialized: boolean;
  deferred: (() => any)[];
  //   archetypes: Archetype[];
  //   archetypesByMask: ArchetypeMask[];
};

export class EntityUndefinedError extends Error {
  constructor() {
    super(`
Seems like you're iterating entities from 0..N and transforming entities.
This may remove the entity from the query results passed to your system.
Try iterating entities backwards:
\`for (let i = entities.length -1; i >= 0; i--) {...}\`
You can also wrap the transformation in \`world.defer(() => {...})\`
`);
  }
}
export class EntityDeletedError extends Error {
  constructor(entity: number) {
    super(`Entity ${entity} is deleted`);
  }
}
export class EntityNotExistError extends Error {
  constructor(entity: number) {
    super(`Entity ${entity} does not exist`);
  }
}
export class WorldNotInitializedError extends Error {
  constructor() {
    super('World not initialized');
  }
}

const _transformEntityForComponent = (world: World, current: Archetype, entity: Entity, componentId: ComponentId) => {
  Archetype.removeEntity(current, entity);

  if (current.adjacent[componentId] !== undefined) {
    current = current.adjacent[componentId]!;
  } else {
    current = Archetype.transform(current, componentId);
    if (world.initialized) {
      //   _tryAddArchetypeToQueries(current);
    }
  }

  Archetype.addEntity(current, entity);
  world.archetypesByEntities[entity] = current;
};

const _assertEntity = (world: World, entity: number) => {
  if (world.archetypesByEntities[entity] === undefined) {
    if (entity === undefined) {
      throw new EntityUndefinedError();
    } else if (world.entityGraveyard.includes(entity)) {
      throw new EntityDeletedError(entity);
    }
    throw new EntityNotExistError(entity);
  }
};

function getComponentId(component: Component): number {
  return typeof component === 'number' ? component : component.id;
}

const _executeDeferred = (world: World) => {
  if (world.deferred.length === 0) return;

  for (const action of world.deferred) {
    action();
  }
  world.deferred.length = 0;
};

const World = {
  new: (): World => {
    return {
      entityGraveyard: [],
      nextEntityId: 0,
      nextComponentId: 0,
      rootArchetype,
      archetypesByEntities: [],
      initialized: false,
      deferred: [],
    };
  },
  hasEntity(world: World, entity: Entity): boolean {
    return world.archetypesByEntities[entity] !== undefined;
  },
  createEntity: (world: World, archetype: Archetype = world.rootArchetype) => {
    const entity = world.entityGraveyard.length > 0 ? world.entityGraveyard.pop()! : world.nextEntityId++;

    Archetype.addEntity(archetype, entity);
    world.archetypesByEntities[entity] = archetype;
    return entity;
  },
  deleteEntity(world: World, entity: number) {
    _assertEntity(world, entity);

    const archetype = world.archetypesByEntities[entity]!;
    Archetype.removeEntity(archetype, entity);
    // much faster than delete operator, but achieves the same (ish)
    // an alternative is to leave it be, and use archetype.entitySet.has(entity) as a check for entity being deleted, but that too is a little slower.
    world.archetypesByEntities[entity] = undefined as any;
    world.entityGraveyard.push(entity);
  },
  createComponentId(world: World) {
    return world.nextComponentId++;
  },
  initialize(world: World) {
    if (world.initialized) return;
    world.initialized = true;

    Archetype.traverseGraph(world.rootArchetype, (arch) => {
      // _tryAddArchetypeToQueries(arch)
    });
  },
  addComponent<T extends Component>(world: World, entity: number, component: T) {
    _assertEntity(world, entity);

    const cid = getComponentId(component);
    const archetype = world.archetypesByEntities[entity]!;

    if (!(archetype.mask & cid)) {
      _transformEntityForComponent(world, archetype, entity, cid);
    }
  },
  removeComponent<T extends Component>(world: World, entity: number, component: T) {
    _assertEntity(world, entity);

    const cid = getComponentId(component);
    const archetype = world.archetypesByEntities[entity]!;

    if (archetype.mask & cid) {
      _transformEntityForComponent(world, archetype, entity, cid);
    }
  },
  defer(world: World, action: () => void) {
    world.deferred.push(action);
  },
  step(world: World, systems: System[]) {
    if (!world.initialized) {
      throw new WorldNotInitializedError();
    }

    for (let s = 0, sl = systems.length; s < sl; s++) {
      const system = systems[s]!;
      system(world);
      //   const archetypes = (system.query as InternalQuery).archetypes;
      //   if (system.type === 1) {
      //     system(archetypes, this, ...args);
      //   } else {
      //     // reverse iterating in case a system adds/removes component resulting in new archetype that matches query for the system
      //     for (let a = archetypes.length - 1; a >= 0; a--) {
      //       const entities = archetypes[a]!.entities;
      //       system.execute(entities, this, ...args);
      //     }
      //   }
    }

    _executeDeferred(world);
  },
};

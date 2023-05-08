// // Sparse Set
const SparseSet = {
  has: (sSet, x) => {
    return sSet.dense[sSet.sparse[x]] === x;
  },
  add: (sSet, value) => {
    if (
      value >= sSet.sparse.length ||
      sSet.sparse[value] === undefined ||
      sSet.sparse[value] >= sSet.dense.length ||
      sSet.dense[sSet.sparse[value]] !== value
    ) {
      sSet.sparse[value] = sSet.dense.length;
      sSet.dense.push(value);
    }
    // sSet.sparse[x] = sSet.dense.push(x) - 1;
  },
  remove: (sSet, value) => {
    if (sSet.dense[sSet.sparse[value]] === value) {
      const swap = sSet.dense.pop();
      if (swap !== value) {
        sSet.dense[sSet.sparse[value]] = swap;
        sSet.sparse[swap] = sSet.sparse[value];
      }
    }
  },
};
const Archetype = {
  new: (id, mask) => {
    const dense = [];
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
  hasComponent: (arch, componentType) => {
    return (arch.mask & componentType) === componentType;
  },
  hasEntity: (arch, entity) => {
    return SparseSet.has(arch.entitySet, entity);
  },
  addEntity: (arch, entity) => {
    return SparseSet.add(arch.entitySet, entity);
  },
  removeEntity: (arch, entity) => {
    return SparseSet.remove(arch.entitySet, entity);
  },
  transform: (archetype, componentId) => {
    if (archetype.adjacent[componentId] !== undefined) {
      return archetype.adjacent[componentId];
    }
    // Mutate the current mask in order to avoid creating garbage (in case the archetype already exists)
    const mask = archetype.mask;
    // mask.xor(componentId);
    archetype.mask ^= componentId;
    const nextId = mask.toString();
    let existingArchetype = null;
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
  traverseGraph: (archetype, callback, traversed = new Set()) => {
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
// # World
const rootArchetype = Archetype.new('root', 0);
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
  constructor(entity) {
    super(`Entity ${entity} is deleted`);
  }
}
export class EntityNotExistError extends Error {
  constructor(entity) {
    super(`Entity ${entity} does not exist`);
  }
}
export class WorldNotInitializedError extends Error {
  constructor() {
    super('World not initialized');
  }
}
const _transformEntityForComponent = (world, current, entity, componentId) => {
  Archetype.removeEntity(current, entity);
  if (current.adjacent[componentId] !== undefined) {
    current = current.adjacent[componentId];
  } else {
    current = Archetype.transform(current, componentId);
    if (world.initialized) {
      //   _tryAddArchetypeToQueries(current);
    }
  }
  Archetype.addEntity(current, entity);
  world.archetypesByEntities[entity] = current;
};
const _assertEntity = (world, entity) => {
  if (world.archetypesByEntities[entity] === undefined) {
    if (entity === undefined) {
      throw new EntityUndefinedError();
    } else if (world.entityGraveyard.includes(entity)) {
      throw new EntityDeletedError(entity);
    }
    throw new EntityNotExistError(entity);
  }
};
function getComponentId(component) {
  return typeof component === 'number' ? component : component.id;
}
const _executeDeferred = (world) => {
  if (world.deferred.length === 0) return;
  for (const action of world.deferred) {
    action();
  }
  world.deferred.length = 0;
};
const World = {
  new: () => {
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
  hasEntity(world, entity) {
    return world.archetypesByEntities[entity] !== undefined;
  },
  createEntity: (world, archetype = world.rootArchetype) => {
    const entity = world.entityGraveyard.length > 0 ? world.entityGraveyard.pop() : world.nextEntityId++;
    Archetype.addEntity(archetype, entity);
    world.archetypesByEntities[entity] = archetype;
    return entity;
  },
  deleteEntity(world, entity) {
    _assertEntity(world, entity);
    const archetype = world.archetypesByEntities[entity];
    Archetype.removeEntity(archetype, entity);
    // much faster than delete operator, but achieves the same (ish)
    // an alternative is to leave it be, and use archetype.entitySet.has(entity) as a check for entity being deleted, but that too is a little slower.
    world.archetypesByEntities[entity] = undefined;
    world.entityGraveyard.push(entity);
  },
  createComponentId(world) {
    return world.nextComponentId++;
  },
  initialize(world) {
    if (world.initialized) return;
    world.initialized = true;
    Archetype.traverseGraph(world.rootArchetype, (arch) => {
      // _tryAddArchetypeToQueries(arch)
    });
  },
  addComponent(world, entity, component) {
    _assertEntity(world, entity);
    const cid = getComponentId(component);
    const archetype = world.archetypesByEntities[entity];
    if (!(archetype.mask & cid)) {
      _transformEntityForComponent(world, archetype, entity, cid);
    }
  },
  removeComponent(world, entity, component) {
    _assertEntity(world, entity);
    const cid = getComponentId(component);
    const archetype = world.archetypesByEntities[entity];
    if (archetype.mask & cid) {
      _transformEntityForComponent(world, archetype, entity, cid);
    }
  },
  defer(world, action) {
    world.deferred.push(action);
  },
  step(world, systems) {
    if (!world.initialized) {
      throw new WorldNotInitializedError();
    }
    for (let s = 0, sl = systems.length; s < sl; s++) {
      const system = systems[s];
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

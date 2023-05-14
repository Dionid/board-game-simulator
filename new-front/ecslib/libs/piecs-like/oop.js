// # Sparse Set
export const createSparseSet = () => {
  const values = [];
  const indices = [];
  return Object.freeze({
    values,
    has(value) {
      return values[indices[value]] === value;
    },
    add(value) {
      if (
        value >= indices.length ||
        indices[value] === undefined ||
        indices[value] >= values.length ||
        values[indices[value]] !== value
      ) {
        indices[value] = values.length;
        values.push(value);
      }
    },
    remove(value) {
      if (values[indices[value]] === value) {
        const swap = values.pop();
        if (swap !== value) {
          values[indices[value]] = swap;
          indices[swap] = indices[value];
        }
      }
    },
  });
};
const Archetype = {
  new: (id, mask) => {
    const ss = createSparseSet();
    return {
      id,
      entitySet: ss,
      entities: ss.values,
      mask,
      adjacent: [],
      hasEntity: ss.has,
    };
  },
  // hasComponent: (arch: Archetype, componentType: ComponentType) => {
  //   return (arch.mask & componentType) === componentType;
  // },
  // addEntity: (arch: Archetype, entity: Entity) => {
  //   return arch.entitySet.add(entity);
  // },
  // removeEntity: (arch: Archetype, entity: Entity) => {
  //   return arch.entitySet.remove(entity);
  // },
  transform: (archetype, componentId) => {
    if (archetype.adjacent[componentId] !== undefined) {
      return archetype.adjacent[componentId];
    }
    // Mutate the current mask in order to avoid creating garbage (in case the archetype already exists)
    // const mask = archetype.mask;
    // mask.xor(componentId);
    archetype.mask ^= 1 << componentId;
    const nextId = archetype.mask.toString();
    let existingArchetype = null;
    Archetype.traverseGraph(archetype, (node) => {
      if (node === archetype) return;
      if (node.id === nextId) {
        existingArchetype = node;
        return false;
      }
      return existingArchetype === null;
    });
    const transformed = existingArchetype || Archetype.new(nextId, archetype.mask);
    // reset current mask of input archetype, see comment above
    // mask.xor(componentId);
    archetype.mask ^= 1 << componentId;
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
function makeMask(componentIds) {
  const ids = componentIds.map((c) => (typeof c === 'number' ? c : c.id));
  const max = Math.max(...ids);
  let mask = max;
  for (let i = 0; i < ids.length; i++) {
    // mask.or(ids[i]!)
    mask |= 1 << ids[i];
  }
  return mask;
}
function makeAndMatcher(matcher, ...matchers) {
  return (target, targetArchetype) =>
    matcher(target, targetArchetype) && matchers.every((m) => m(target, targetArchetype));
}
function makeOrMatcher(matcher, ...matchers) {
  return (target, targetArchetype) =>
    matcher(target, targetArchetype) || matchers.some((m) => m(target, targetArchetype));
}
const alwaysTrue = (_, __) => true;
function createBuilder() {
  let _matchers = [];
  return {
    get matchers() {
      return _matchers;
    },
    or(cb) {
      const [first = alwaysTrue, ...rest] = _matchers;
      _matchers = [makeOrMatcher(makeAndMatcher(first, ...rest), ...cb(createBuilder()).matchers)];
      return this;
    },
    every(...components) {
      if (components.length === 0) {
        return this;
      }
      const mask = makeMask(components);
      _matchers.push((target, _targetArchetype) => (target & mask) === mask);
      return this;
    },
    some(...components) {
      if (components.length === 0) {
        return this;
      }
      const mask = makeMask(components);
      _matchers.push((target, _targetArchetype) => (target & mask) !== 0);
      return this;
    },
    not(...components) {
      if (components.length === 0) {
        return this;
      }
      const mask = makeMask(components);
      _matchers.push((target, _targetArchetype) => (target & mask) === 0);
      return this;
    },
    none(...components) {
      if (components.length === 0) {
        return this;
      }
      const mask = makeMask(components);
      _matchers.push((target, _targetArchetype) => (target & mask) !== mask);
      return this;
    },
    prefabricated(archetype) {
      _matchers.push((target, _targetArchetype) => (target & archetype.mask) === archetype.mask);
      return this;
    },
    custom(matcher) {
      _matchers.push(matcher);
      return this;
    },
    toQuery() {
      const [first = alwaysTrue, ...rest] = _matchers;
      const matcher = rest.length ? makeAndMatcher(first, ...rest) : first;
      const archetypes = [];
      return Object.freeze({
        archetypes,
        tryAdd(archetype) {
          if (!matcher(archetype.mask, archetype)) return false;
          archetypes.push(archetype);
          return true;
        },
      });
    },
  };
}
export function createQuery(callback) {
  return callback(createBuilder()).toQuery();
}
// # World
const rootArchetype = Archetype.new('root', 0);
// type World = {
//   entityGraveyard: Entity[];
//   nextEntityId: Entity;
//   nextComponentId: number;
//   rootArchetype: Archetype;
//   archetypesByEntities: Archetype[];
//   initialized: boolean;
//   deferred: (() => any)[];
//   queries: Query[];
//   //   archetypes: Archetype[];
//   //   archetypesByMask: ArchetypeMask[];
// };
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
function getComponentId(component) {
  return typeof component === 'number' ? component : component.id;
}
export class World {
  constructor() {
    this.rootArchetype = rootArchetype;
    this.archetypesByEntities = [];
    this.entityGraveyard = [];
    this.nextEntityId = 0 >>> 0;
    this.nextComponentId = 0 >>> 0;
    this.deferred = [];
    this.initialized = false;
    this.queries = [];
  }
  // new: (): World => {
  //   return {
  //     entityGraveyard: [],
  //     nextEntityId: 0,
  //     nextComponentId: 0,
  //     rootArchetype,
  //     archetypesByEntities: [],
  //     initialized: false,
  //     deferred: [],
  //     queries: [],
  //   };
  // }
  _executeDeferred() {
    if (this.deferred.length === 0) return;
    for (const action of this.deferred) {
      action();
    }
    this.deferred.length = 0;
  }
  _tryAddArchetypeToQueries(archetype) {
    for (const query of this.queries) {
      query.tryAdd(archetype);
    }
  }
  _transformEntityForComponent(current, entity, componentId) {
    // Archetype.removeEntity(current, entity);
    current.entitySet.remove(entity);
    if (current.adjacent[componentId] !== undefined) {
      current = current.adjacent[componentId];
    } else {
      current = Archetype.transform(current, componentId);
      if (this.initialized) {
        this._tryAddArchetypeToQueries(current);
      }
    }
    // Archetype.addEntity(current, entity);
    current.entitySet.add(entity);
    this.archetypesByEntities[entity] = current;
  }
  _assertEntity(entity) {
    if (this.archetypesByEntities[entity] === undefined) {
      if (entity === undefined) {
        throw new EntityUndefinedError();
      } else if (this.entityGraveyard.includes(entity)) {
        throw new EntityDeletedError(entity);
      }
      throw new EntityNotExistError(entity);
    }
  }
  hasEntity(entity) {
    return this.archetypesByEntities[entity] !== undefined;
  }
  createEntity(archetype = this.rootArchetype) {
    const entity = this.entityGraveyard.length > 0 ? this.entityGraveyard.pop() : this.nextEntityId++;
    // Archetype.addEntity(archetype, entity);
    archetype.entitySet.add(entity);
    this.archetypesByEntities[entity] = archetype;
    return entity;
  }
  deleteEntity(entity) {
    this._assertEntity(entity);
    const archetype = this.archetypesByEntities[entity];
    // Archetype.removeEntity(archetype, entity);
    archetype.entitySet.remove(entity);
    // much faster than delete operator, but achieves the same (ish)
    // an alternative is to leave it be, and use archetype.entitySet.has(entity) as a check for entity being deleted, but that too is a little slower.
    this.archetypesByEntities[entity] = undefined;
    this.entityGraveyard.push(entity);
  }
  createComponentId() {
    return this.nextComponentId++;
  }
  initialize() {
    if (this.initialized) return;
    this.initialized = true;
    Archetype.traverseGraph(this.rootArchetype, (arch) => {
      this._tryAddArchetypeToQueries(arch);
    });
  }
  prefabricate(components) {
    const ids = components.map(getComponentId);
    const max = Math.max(...ids);
    if (max >= this.nextComponentId) {
      this.nextComponentId = (max + 1) >>> 0;
    }
    let archetype = this.rootArchetype;
    for (let i = 0, l = ids.length; i < l; i++) {
      const componentId = ids[i];
      if (archetype.adjacent[componentId] !== undefined) {
        archetype = archetype.adjacent[componentId];
      } else {
        archetype = Archetype.transform(archetype, componentId);
        if (this.initialized) {
          this._tryAddArchetypeToQueries(archetype);
        }
      }
    }
    return archetype;
  }
  addComponent(entity, component) {
    this._assertEntity(entity);
    const cid = getComponentId(component);
    const archetype = this.archetypesByEntities[entity];
    if (!(archetype.mask & cid)) {
      this._transformEntityForComponent(archetype, entity, cid);
    }
  }
  removeComponent(entity, component) {
    this._assertEntity(entity);
    const cid = getComponentId(component);
    const archetype = this.archetypesByEntities[entity];
    if (archetype.mask & cid) {
      this._transformEntityForComponent(archetype, entity, cid);
    }
  }
  defer(action) {
    this.deferred.push(action);
  }
  step(systems) {
    if (!this.initialized) {
      throw new WorldNotInitializedError();
    }
    for (let s = 0, sl = systems.length; s < sl; s++) {
      const system = systems[s];
      system(this);
    }
    this._executeDeferred();
  }
  createQuery(callback) {
    const query = createQuery(callback);
    this.queries.push(query);
    return query;
  }
}
// export const World = {
//   new: (): World => {
//     return {
//       entityGraveyard: [],
//       nextEntityId: 0,
//       nextComponentId: 0,
//       rootArchetype,
//       archetypesByEntities: [],
//       initialized: false,
//       deferred: [],
//       queries: [],
//     };
//   },
//   hasEntity(world: World, entity: Entity): boolean {
//     return this.archetypesByEntities[entity] !== undefined;
//   },
//   createEntity: (world: World, archetype: Archetype = this.rootArchetype) => {
//     const entity = world.entityGraveyard.length > 0 ? world.entityGraveyard.pop()! : world.nextEntityId++;
//     // Archetype.addEntity(archetype, entity);
//     archetype.entitySet.add(entity);
//     world.archetypesByEntities[entity] = archetype;
//     return entity;
//   },
//   deleteEntity(world: World, entity: number) {
//     _assertEntity(world, entity);
//     const archetype = world.archetypesByEntities[entity]!;
//     // Archetype.removeEntity(archetype, entity);
//     archetype.entitySet.remove(entity);
//     // much faster than delete operator, but achieves the same (ish)
//     // an alternative is to leave it be, and use archetype.entitySet.has(entity) as a check for entity being deleted, but that too is a little slower.
//     world.archetypesByEntities[entity] = undefined as any;
//     world.entityGraveyard.push(entity);
//   },
//   createComponentId() {
//     return world.nextComponentId++;
//   },
//   initialize(world: World) {
//     if (world.initialized) return;
//     world.initialized = true;
//     Archetype.traverseGraph(world.rootArchetype, (arch) => {
//       _tryAddArchetypeToQueries(world, arch);
//     });
//   },
//   prefabricate<T extends Component>(world: World, components: T[]): Archetype {
//     const ids = components.map(getComponentId);
//     const max = Math.max(...ids);
//     if (max >= world.nextComponentId) {
//       world.nextComponentId = (max + 1) >>> 0;
//     }
//     let archetype = world.rootArchetype;
//     for (let i = 0, l = ids.length; i < l; i++) {
//       const componentId = ids[i]!;
//       if (archetype.adjacent[componentId] !== undefined) {
//         archetype = archetype.adjacent[componentId]!;
//       } else {
//         archetype = Archetype.transform(archetype, componentId);
//         if (world.initialized) {
//           _tryAddArchetypeToQueries(world, archetype);
//         }
//       }
//     }
//     return archetype;
//   },
//   addComponent<T extends Component>(world: World, entity: number, component: T) {
//     _assertEntity(world, entity);
//     const cid = getComponentId(component);
//     const archetype = world.archetypesByEntities[entity]!;
//     if (!(archetype.mask & cid)) {
//       _transformEntityForComponent(world, archetype, entity, cid);
//     }
//   },
//   removeComponent<T extends Component>(world: World, entity: number, component: T) {
//     _assertEntity(world, entity);
//     const cid = getComponentId(component);
//     const archetype = world.archetypesByEntities[entity]!;
//     if (archetype.mask & cid) {
//       _transformEntityForComponent(world, archetype, entity, cid);
//     }
//   },
//   defer(world: World, action: () => void) {
//     world.deferred.push(action);
//   },
//   step(world: World, systems: System[]) {
//     if (!world.initialized) {
//       throw new WorldNotInitializedError();
//     }
//     for (let s = 0, sl = systems.length; s < sl; s++) {
//       const system = systems[s]!;
//       system(world);
//     }
//     _executeDeferred(world);
//   },
//   createQuery: (world: World, callback: (builder: QueryBuilder) => QueryBuilder) => {
//     const query = createQuery(callback);
//     world.queries.push(query);
//     return query;
//   },
// };
// # Example
// const world = World.new();
// type Vector2 = {
//   x: number[];
//   y: number[];
// };
// const Position: Vector2 & Component = {
//   id: World.createComponentId(world),
//   x: [],
//   y: [],
// };
// const Velocity: Vector2 & Component = {
//   id: World.createComponentId(world),
//   x: [],
//   y: [],
// };
// type Size = {
//   width: number[];
//   height: number[];
// };
// const Size: Size & Component = {
//   id: World.createComponentId(world),
//   width: [],
//   height: [],
// };
// const positionVelocityArchetype = World.prefabricate(world, [Position, Velocity]);
// const positionVelocitySizeArchetype = World.prefabricate(world, [Position, Velocity, Size]);
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// const positionArchetype = World.prefabricate(world, [Position]);
// const moveSystem = (world: World) => {
//   const query = World.createQuery(world, (q) => q.every(Position, Velocity));
//   const archetypes = query.archetypes;
//   return (world: World) => {
//     console.log('archetypes', archetypes);
//     for (let a = archetypes.length - 1; a >= 0; a--) {
//       for (const entity of archetypes[a]!.entities) {
//         Position.x[entity] += Velocity.x[entity];
//         Position.y[entity] += Velocity.y[entity];
//         if (Velocity.x[entity] > 0) Velocity.x[entity] -= 1;
//         if (Velocity.y[entity] > 0) Velocity.y[entity] -= 1;
//       }
//     }
//   };
// };
// const systems = [moveSystem(world)];
// World.initialize(world);
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// const entity0 = World.createEntity(world);
// const entity = World.createEntity(world, positionVelocityArchetype);
// Position.x[entity] = 0;
// Position.y[entity] = 0;
// Velocity.x[entity] = 2;
// Velocity.y[entity] = 2;
// const entit2 = World.createEntity(world, positionVelocityArchetype);
// Position.x[entit2] = 0;
// Position.y[entit2] = 0;
// Velocity.x[entit2] = 2;
// Velocity.y[entit2] = 2;
// // console.log('world', world);
// World.step(world, systems);
// const entit3 = World.createEntity(world, positionVelocitySizeArchetype);
// Position.x[entit3] = 0;
// Position.y[entit3] = 0;
// Velocity.x[entit3] = 2;
// Velocity.y[entit3] = 2;
// Size.width[entit3] = 3;
// Size.height[entit3] = 3;
// World.step(world, systems);
// // console.log('world', world);
// console.log('Position', Position);
// console.log('Velocity', Velocity);
// console.log('Size', Size);

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

    return {
      id,
      entitySet: {
        sparse: [],
        dense,
      },
      entities: dense,
      mask,
      adjacent: [],
    };
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
    // const mask = archetype.mask;
    // mask.xor(componentId);
    archetype.mask ^= 1 << componentId;
    const nextId = archetype.mask.toString();

    let existingArchetype: Archetype | null = null;
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

// # Query

type QueryMatcher = (target: ArchetypeMask, archetype: Archetype) => boolean;

function makeMask<T extends Component>(componentIds: T[]): number {
  const ids = componentIds.map((c) => (typeof c === 'number' ? c : c.id));
  const max = Math.max(...ids);
  let mask = max;
  for (let i = 0; i < ids.length; i++) {
    // mask.or(ids[i]!)
    mask |= 1 << ids[i]!;
  }
  return mask;
}

function makeAndMatcher(matcher: QueryMatcher, ...matchers: QueryMatcher[]): QueryMatcher {
  return (target, targetArchetype) =>
    matcher(target, targetArchetype) && matchers.every((m) => m(target, targetArchetype));
}

function makeOrMatcher(matcher: QueryMatcher, ...matchers: QueryMatcher[]): QueryMatcher {
  return (target, targetArchetype) =>
    matcher(target, targetArchetype) || matchers.some((m) => m(target, targetArchetype));
}

export type Query = {
  /**
   * All archetypes matching the query
   */
  readonly archetypes: ReadonlyArray<Archetype>;
};

export type InternalQuery = Query & {
  readonly tryAdd: (archetype: Archetype) => boolean;
  readonly archetypes: ReadonlyArray<Archetype>;
};

const alwaysTrue: QueryMatcher = (_: ArchetypeMask, __: Archetype) => true;

export type QueryBuilder = {
  /**
   * Archetypes that has *every* componentId of `componentIds` will be included in the result
   */
  every<T extends Component>(...cids: T[]): QueryBuilder;
  /**
   * Archetypes that has *some* of the `componentIds` will be included in the result
   */
  some<T extends Component>(...cids: T[]): QueryBuilder;
  /**
   * Archetypes that has *some* of the `componentIds` will *not* be included in the result
   */
  not<T extends Component>(...cids: T[]): QueryBuilder;
  /**
   * Archetypes that has *every* componentId of `componentIds` will *not* be included in the result
   */
  none<T extends Component>(...cids: T[]): QueryBuilder;
  /**
   * Build a subquery to match a different set of Archetypes.
   * You may combine as many or subqueries and nested or subqueries as you need
   */
  or(callback: (builder: QueryBuilder) => QueryBuilder): QueryBuilder;
  /**
   * Add a custom query matcher.
   * The matcher function receives a `BitSet` that indicates the presence of `componentIds`, and the `Archetype` associated with the `BitSet`
   */
  custom(matcher: QueryMatcher): QueryBuilder;
  /**
   * Query for a prefabricated `archetype`.
   * May match descendant archetypes, ie archetypes with all of the component ids in the prefab *and* additional component ids added to entities in the prefabricated archetype or descendant archetypes
   */
  prefabricated(archetype: Archetype): QueryBuilder;
  toQuery(): Query;
  readonly matchers: ReadonlyArray<QueryMatcher>;
};

function createBuilder(): QueryBuilder {
  let _matchers: QueryMatcher[] = [];
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

      const archetypes: Archetype[] = [];
      return Object.freeze({
        archetypes,
        tryAdd(archetype: Archetype): boolean {
          if (!matcher(archetype.mask, archetype)) return false;
          archetypes.push(archetype);
          return true;
        },
      });
    },
  };
}

export function createQuery(callback: (builder: QueryBuilder) => QueryBuilder): Query {
  return callback(createBuilder()).toQuery();
}

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
  queries: Query[];
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

const _tryAddArchetypeToQueries = (world: World, archetype: Archetype) => {
  for (const query of world.queries) {
    (query as InternalQuery).tryAdd(archetype);
  }
};

const _transformEntityForComponent = (world: World, current: Archetype, entity: Entity, componentId: ComponentId) => {
  Archetype.removeEntity(current, entity);

  if (current.adjacent[componentId] !== undefined) {
    current = current.adjacent[componentId]!;
  } else {
    current = Archetype.transform(current, componentId);
    if (world.initialized) {
      _tryAddArchetypeToQueries(world, current);
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
      queries: [],
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
      _tryAddArchetypeToQueries(world, arch);
    });
  },
  prefabricate<T extends Component>(world: World, components: T[]): Archetype {
    const ids = components.map(getComponentId);
    const max = Math.max(...ids);
    if (max >= world.nextComponentId) {
      world.nextComponentId = (max + 1) >>> 0;
    }
    let archetype = world.rootArchetype;

    for (let i = 0, l = ids.length; i < l; i++) {
      const componentId = ids[i]!;

      if (archetype.adjacent[componentId] !== undefined) {
        archetype = archetype.adjacent[componentId]!;
      } else {
        archetype = Archetype.transform(archetype, componentId);
        if (world.initialized) {
          _tryAddArchetypeToQueries(world, archetype);
        }
      }
    }
    return archetype;
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
    }

    _executeDeferred(world);
  },
  createQuery: (world: World, callback: (builder: QueryBuilder) => QueryBuilder) => {
    const query = createQuery(callback);
    world.queries.push(query);

    return query;
  },
};

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

import { Archetype } from './archetype';
import { BitSet } from './bit-set';
import { Query } from './query';
// export function spawnEntity(world: World): [Entity, Archetype<[]>];
// export function spawnEntity<Arch extends Archetype>(world: World, prefabricate: Arch): [Entity, Arch];
// export function spawnEntity<Arch extends Archetype>(world: World, prefabricate?: Arch) {
//   const entity = World.allocateEntityId(world);
//   const archetype = prefabricate ?? world.emptyArchetype;
//   Archetype.addEntity(archetype, entity);
//   world.archetypesByEntities[entity] = archetype;
//   return [entity, archetype];
// }
export function spawnEntity(world, prefabricate) {
  const entity = World.allocateEntityId(world);
  const archetype = prefabricate ?? world.emptyArchetype;
  Archetype.addEntity(archetype, entity);
  world.archetypesByEntities[entity] = archetype;
  return entity;
}
export const World = {
  new: (props) => {
    const emptyBitSet = BitSet.new(8);
    return {
      size: props?.size ?? 100000,
      nextComponentId: 0,
      nextEntityId: 0,
      queries: [],
      components: [],
      archetypes: [],
      emptyArchetype: Archetype.new('empty', [], emptyBitSet),
      // graveyardArchetype: Archetype.new('graveyard', BitSet.new(8)),
      entityGraveyard: [],
      archetypesIndexById: {},
      archetypesByEntities: [],
      resizeSubscribers: [],
      deferred: [],
    };
  },
  subscribeOnResize: (world, callback) => {
    world.resizeSubscribers.push(callback);
  },
  defer: (world, callback) => {
    world.deferred.push(callback);
  },
  applyDeferred: (world) => {
    for (let i = 0; i < world.deferred.length; i++) {
      world.deferred[i](world);
    }
    world.deferred = [];
  },
  step: (world, systems) => {
    for (let i = 0; i < systems.length; i++) {
      const system = systems[i];
      system(world);
    }
    if (world.deferred.length > 0) {
      World.applyDeferred(world);
    }
  },
  // # Query
  registerQuery: (world, components) => {
    const query = Query.new(components);
    world.queries.push(query);
    for (let i = 0; i < world.archetypes.length; i++) {
      const archetype = world.archetypes[i];
      query.tryAdd(archetype);
    }
    return query.result;
  },
  // # Archetype
  // TODO: Return
  // selectArchetypes: (world: World, componentIds: ComponentId[], callback: (archetype: Archetype) => void) => {
  //   const queryMask = Query.makeMask(componentIds);
  //   for (let i = world.archetypes.length - 1; i >= 0; i--) {
  //     const archetype = world.archetypes[i];
  //     if (BitSet.contains(archetype.mask, queryMask)) {
  //       callback(archetype);
  //     }
  //   }
  // },
  prefabricate: (world, componentSchemas) => {
    let archetype = world.emptyArchetype;
    for (let i = 0; i < componentSchemas.length; i++) {
      archetype = World.getOrCreateArchetype(world, archetype, componentSchemas[i]);
    }
    return archetype;
  },
  // # Component
  registerComponentSchemaId: (world) => {
    return world.nextComponentId++;
  },
  // # Entity
  allocateEntityId: (world) => {
    if (world.entityGraveyard.length > 0) {
      return world.entityGraveyard.pop();
    }
    // # Resize world
    if (world.nextEntityId >= world.size) {
      const newSize = world.size * 2;
      console.log(`Resizing world from ${world.size} to ${newSize}`);
      world.size = newSize;
      for (let i = 0; i < world.resizeSubscribers.length; i++) {
        world.resizeSubscribers[i](newSize);
      }
    }
    return world.nextEntityId++;
  },
  spawnEntity,
  destroyEntity: (world, entity) => {
    const archetype = world.archetypesByEntities[entity];
    Archetype.removeEntity(archetype, entity);
    world.archetypesByEntities[entity] = undefined; // QUESTION: see in piecs
    world.entityGraveyard.push(entity);
  },
  getOrCreateArchetype: (world, current, componentSchema) => {
    const componentId = componentSchema.id;
    if (current.adjacent[componentId] !== undefined) {
      return current.adjacent[componentId];
    }
    const mask = current.mask;
    BitSet.xor(mask, componentId);
    const nextId = BitSet.toString(mask);
    let archetypeIndex = world.archetypesIndexById[nextId];
    if (archetypeIndex === undefined) {
      // TODO: In one case we need to add, in another to remove
      const components = [componentSchema];
      for (let i = 0; i < current.components.length; i++) {
        const component = current.components[i];
        if (!component) continue;
        components.push(component.schema);
      }
      const newArchetype = Archetype.new(nextId, components, BitSet.copy(mask));
      archetypeIndex = world.archetypes.push(newArchetype) - 1;
      world.archetypesIndexById[newArchetype.id] = archetypeIndex;
      current.adjacent[componentId] = newArchetype;
      newArchetype.adjacent[componentId] = current;
    }
    BitSet.xor(mask, componentId);
    return world.archetypes[archetypeIndex];
  },
  addComponent: (world, entity, componentSchema, archetype) => {
    const arch = archetype ?? world.archetypesByEntities[entity];
    // # If current entity archetype doesn't have this component,
    // then change archetype
    if (!BitSet.has(arch.mask, componentSchema.id)) {
      const newArchetype = World.getOrCreateArchetype(world, arch, componentSchema);
      Archetype.moveEntity(arch, newArchetype, entity);
      world.archetypesByEntities[entity] = newArchetype;
    }
  },
  removeComponent: (world, entity, componentSchema, archetype) => {
    const arch = archetype ?? world.archetypesByEntities[entity];
    // # If current entity archetype doesn't have this component,
    // then change archetype
    if (BitSet.has(arch.mask, componentSchema.id)) {
      const newArchetype = World.getOrCreateArchetype(world, arch, componentSchema);
      Archetype.moveEntity(arch, newArchetype, entity);
      world.archetypesByEntities[entity] = newArchetype;
    }
  },
};

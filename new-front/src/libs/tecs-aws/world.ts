import { Component } from 'react';
import { System } from './system';
import { Entity } from './entity';
import { Archetype, ArchetypeId } from './archetype';
import { BitSet } from './bit-set';
import { ComponentSchema, ComponentSchemaId } from './component';
import { Query } from './query';

export type World = {
  deferred: ((world: World) => void)[];
  queries: Query<any>[];
  // # Size
  size: number;
  resizeSubscribers: ((newSize: number) => void)[];
  // # Components
  nextComponentId: number;
  components: Component<any>[];
  // # Entities
  nextEntityId: Entity; // 100% number
  entityGraveyard: Entity[]; // 100% array
  // # Archetypes
  emptyArchetype: Archetype<[]>;
  // graveyardArchetype: Archetype;
  archetypes: Archetype[]; // 100% array
  archetypesIndexById: Record<ArchetypeId, number>;
  archetypesByEntities: Archetype<any>[]; // Maybe, change to Map / Record?
};

export const World = {
  new: (props?: { size?: number }): World => {
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
  subscribeOnResize: (world: World, callback: (newSize: number) => void) => {
    world.resizeSubscribers.push(callback);
  },
  defer: (world: World, callback: (world: World) => void) => {
    world.deferred.push(callback);
  },
  applyDeferred: (world: World) => {
    for (let i = 0; i < world.deferred.length; i++) {
      world.deferred[i](world);
    }
    world.deferred = [];
  },
  step: (world: World, systems: System[]) => {
    for (let i = 0; i < systems.length; i++) {
      const system = systems[i];
      system(world);
    }
    if (world.deferred.length > 0) {
      World.applyDeferred(world);
    }
  },

  // # Query

  registerQuery: <C extends ReadonlyArray<ComponentSchema<any>>>(world: World, components: C) => {
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
  prefabricate: <CSL extends ReadonlyArray<ComponentSchema>>(world: World, componentSchemas: CSL): Archetype<CSL> => {
    let archetype = world.emptyArchetype;

    for (let i = 0; i < componentSchemas.length; i++) {
      archetype = World.getOrCreateArchetype(world, archetype, componentSchemas[i]);
    }

    return archetype as Archetype<CSL>;
  },

  // # Component

  registerComponentSchemaId: (world: World): ComponentSchemaId => {
    return world.nextComponentId++;
  },

  // # Entity
  allocateEntityId: (world: World): Entity => {
    if (world.entityGraveyard.length > 0) {
      return world.entityGraveyard.pop()!;
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

  spawnEntity: (world: World, prefabricate?: Archetype<any>) => {
    const entity = World.allocateEntityId(world);
    const archetype = prefabricate ?? world.emptyArchetype;
    Archetype.addEntity(archetype, entity);
    world.archetypesByEntities[entity] = archetype;
    return entity;
  },

  destroyEntity: (world: World, entity: Entity) => {
    const archetype = world.archetypesByEntities[entity];
    Archetype.removeEntity(archetype, entity);
    world.archetypesByEntities[entity] = undefined as unknown as Archetype<any>; // QUESTION: see in piecs
    world.entityGraveyard.push(entity);
  },

  getOrCreateArchetype: <CS extends ComponentSchema<any>>(
    world: World,
    current: Archetype<CS[]>,
    componentSchema: CS
  ) => {
    const componentId = componentSchema.id;

    if (current.adjacent[componentId] !== undefined) {
      return current.adjacent[componentId];
    }

    const mask = current.mask;
    BitSet.xor(mask, componentId);
    const nextId = BitSet.toString(mask);
    let archetypeIndex = world.archetypesIndexById[nextId];

    if (archetypeIndex === undefined) {
      const newArchetype = Archetype.new(
        nextId,
        [...current.components.map((c) => c.schema), componentSchema],
        BitSet.copy(mask)
      );
      archetypeIndex = world.archetypes.push(newArchetype) - 1;
      world.archetypesIndexById[newArchetype.id] = archetypeIndex;
      current.adjacent[componentId] = newArchetype;
      newArchetype.adjacent[componentId] = current;
    }

    BitSet.xor(mask, componentId);

    return world.archetypes[archetypeIndex];
  },

  addComponent: <CS extends ComponentSchema<any>>(
    world: World,
    entity: Entity,
    componentSchema: CS,
    archetype?: Archetype<[CS]>
  ) => {
    const arch = archetype ?? world.archetypesByEntities[entity];
    // # If current entity archetype doesn't have this component,
    // then change archetype
    if (!BitSet.has(arch.mask, componentSchema.id)) {
      const newArchetype = World.getOrCreateArchetype(world, arch, componentSchema);
      Archetype.moveEntity(arch, newArchetype, entity);
      world.archetypesByEntities[entity] = newArchetype;
    }
  },

  removeComponent: <CS extends ComponentSchema<any>>(
    world: World,
    entity: Entity,
    componentSchema: CS,
    archetype?: Archetype<CS[]>
  ) => {
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

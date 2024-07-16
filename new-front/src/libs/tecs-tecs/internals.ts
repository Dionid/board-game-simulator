import { Schema, SchemaId } from './schema';
import { World } from './world';

export type Internals = {
  // # Worlds
  worlds: World[];
  currentWorldId: number;
  worldIds: number;

  // # Components
  schemaIdBySchema: WeakMap<Schema, number>;
  schemaById: Map<number, Schema>;
  nextSchemaId: number;
};

export const UNSAFE_internals: Internals = {
  // # Worlds
  worlds: [],
  currentWorldId: -1,
  worldIds: 0,

  // # Schema
  schemaIdBySchema: new WeakMap(),
  schemaById: new Map(),
  nextSchemaId: 0,
};

export const Internals = {
  registerSchema: (world: World, schema: Schema, schemaId?: SchemaId) => {
    let type: number | undefined = UNSAFE_internals.schemaIdBySchema.get(schema);
    if (type !== undefined) {
      return type;
    }
    type = schemaId;
    if (type === undefined) {
      while (UNSAFE_internals.schemaById.has(UNSAFE_internals.nextSchemaId)) {
        UNSAFE_internals.nextSchemaId++;
      }
      type = UNSAFE_internals.nextSchemaId;
    } else if (UNSAFE_internals.schemaById.has(type)) {
      throw new Error('Failed to register component type: a component with same id is already registered');
    }
    UNSAFE_internals.schemaById.set(type, schema);
    UNSAFE_internals.schemaIdBySchema.set(schema, type);

    // # Create Archetype
    World.registerArchetype(world, schema);

    return type;
  },
  getSchemaId: (world: World, schema: Schema) => {
    let type = UNSAFE_internals.schemaIdBySchema.get(schema);
    if (type === undefined) {
      type = Internals.registerSchema(world, schema);
    }
    return type;
  },
};

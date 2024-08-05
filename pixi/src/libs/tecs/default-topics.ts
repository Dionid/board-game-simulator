import { Entity } from './core';
import { Component, Schema, SchemaToType } from './schema';
import { newTopic } from './topic';

// # Entity spawned

export type EntitySpawned = {
  name: 'entity-spawned';
  entity: Entity;
};

export const entitySpawned = newTopic<EntitySpawned>();

// # Entity killed

export type EntityKilled = {
  name: 'entity-killed';
  entity: Entity;
};

export const entityKilled = newTopic<EntityKilled>();

// # Schema added

export type SchemaAdded<S extends Schema> = {
  name: 'schema-added';
  entity: Entity;
  schema: S;
  component?: Component<S>;
};

export const schemaAdded = newTopic<SchemaAdded<any>>();

// # Schema removed

export type SchemaRemoved<S extends Schema> = {
  name: 'schema-removed';
  entity: Entity;
  schema: S;
  component?: Component<S>;
};

export const schemaRemoved = newTopic<SchemaRemoved<any>>();

// # Schema updated

export type ComponentUpdated<S extends Schema> = {
  name: 'component-updated';
  entity: Entity;
  schema: S;
  old: Component<S>;
  new: Component<S>;
};

export const componentUpdated = newTopic<ComponentUpdated<any>>();

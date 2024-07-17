import { Entity, $kind } from './core';
import { SparseSet } from './sparse-set';
import { Schema, SchemaType, SchemaId, $tag, $aos, $soa } from './schema';
import { Internals } from './internals';
import { ArrayContains } from './ts-types';
import { safeGuard } from './switch';

export type ArchetypeTableRow<S extends Schema> = SchemaType<S>[];

export type ArchetypeTable<SL extends ReadonlyArray<Schema>> = {
  [K in keyof SL]: ArchetypeTableRow<SL[K]>;
};

export type ArchetypeId = string;

export const ArchetypeId = {
  create: (schemas: Schema[]) => {
    return schemas
      .map((component) => Internals.getSchemaId(component))
      .sort((a, b) => a - b)
      .join(',');
  },
};

export type Archetype<SL extends ReadonlyArray<Schema> = ReadonlyArray<Schema>> = {
  id: ArchetypeId;
  type: SL;
  entitiesSS: SparseSet;
  entities: number[]; // dense
  table: ArchetypeTable<SL>;
};

// OK, BUT can be changed to bitmask
export function isSchemaInArchetype(arch: Archetype<any>, schema: Schema): boolean;
export function isSchemaInArchetype(arch: Archetype<any>, schemaId: SchemaId): boolean;
export function isSchemaInArchetype(arch: Archetype<any>, schema: SchemaId | Schema): boolean {
  const schemaId = typeof schema === 'number' ? schema : Internals.getSchemaId(schema);
  return arch.table[schemaId] !== undefined;
}

// OK
export function isEntityInArchetype(arch: Archetype<any>, entity: Entity) {
  const denseInd = arch.entitiesSS.sparse[entity];
  if (!denseInd) {
    return false;
  }
  return arch.entitiesSS.dense[denseInd] === entity;
}

// OK
export function addArchetypeEntity<CL extends Schema[]>(arch: Archetype<CL>, entity: Entity) {
  // # Add entity to archetype
  SparseSet.add(arch.entitiesSS, entity);

  for (let i = 0; i < arch.type.length; i++) {
    const schema = arch.type[i];

    switch (schema[$kind]) {
      case $tag:
        continue;
      case $aos:
        const schemaId = Internals.getSchemaId(schema);

        const componentTable = arch.table[schemaId];

        if (!componentTable) {
          throw new Error(`Can't find component ${schemaId} on this archetype ${arch.id}`);
        }

        const component = Schema.default(schema);

        componentTable.push(component);
        break;
      case $soa:
        throw new Error('Not implemented');
      default:
        safeGuard(schema[$kind]);
    }
  }
}

// OK
export function removeEntity<CL extends Schema[]>(arch: Archetype<CL>, entity: Entity) {
  // # Remove entity and component to archetype
  const sSet = arch.entitiesSS;

  const denseInd = sSet.sparse[entity];

  if (sSet.dense[denseInd] === entity && sSet.dense.length > 0) {
    const swapEntity = sSet.dense.pop()!;

    for (let i = 0; i < arch.type.length; i++) {
      const schema = arch.type[i];

      switch (schema[$kind]) {
        case $tag:
          continue;
        case $aos:
          const componentId = Internals.getSchemaId(schema);

          const componentTable = arch.table[componentId];
          if (!componentTable) {
            continue;
          }

          const component = componentTable.pop()!;
          if (swapEntity !== entity) {
            componentTable[denseInd] = component;
          }
          break;
        case $soa:
          throw new Error('Not implemented');
        default:
          safeGuard(schema[$kind]);
      }
    }
    if (swapEntity !== entity) {
      sSet.dense[denseInd] = swapEntity;
      sSet.sparse[swapEntity] = denseInd;
    }
  }

  return;
}

// OK
export function moveEntity<CL extends Schema[]>(from: Archetype<CL>, to: Archetype<CL>, entity: Entity) {
  // # Check if entity is in `to` or not in `from`
  if (
    to.entitiesSS.dense[to.entitiesSS.sparse[entity]] === entity ||
    from.entitiesSS.dense[from.entitiesSS.sparse[entity]] !== entity
  ) {
    return false;
  }

  // # Add to new archetype
  SparseSet.add(to.entitiesSS, entity);

  // # Move all Components to new Archetype Table
  const fromDenseEntityInd = from.entitiesSS.sparse[entity]!;
  for (let i = 0; i < to.table.length; i++) {
    const componentId = i;

    const toComponentTable = to.table[componentId];
    if (!toComponentTable) {
      continue;
    }

    const fromComponentTable = from.table[componentId];
    if (!fromComponentTable) {
      continue;
    }

    const schema = Internals.getSchemaById(componentId);
    if (!schema) {
      throw new Error(`Can't find schema ${componentId}`);
    }

    switch (schema[$kind]) {
      case $tag:
        continue;
      case $soa:
        throw new Error('Not implemented');
      case $aos:
        setArchetypeComponent(to, entity, componentId, fromComponentTable[fromDenseEntityInd]);
        break;
      default:
        safeGuard(schema[$kind]);
    }
  }

  // # Remove it from `from` entities (sSet dense) and components
  Archetype.removeEntity(from, entity);
}

// OK
export function setArchetypeComponent<S extends Schema>(
  arch: Archetype<any>,
  entity: Entity,
  schemaOrId: SchemaId | Schema,
  component?: SchemaType<S>
): boolean {
  const schemaId = typeof schemaOrId === 'number' ? schemaOrId : Internals.getSchemaId(schemaOrId);
  const schema = (typeof schemaOrId === 'number' ? Internals.getSchemaById(schemaOrId) : schemaOrId) as S | undefined;

  if (!schema) {
    throw new Error(`Can't find schema ${schemaId}`);
  }

  // # Add component to archetype
  const componentTable = arch.table[schemaId];

  if (!componentTable) {
    throw new Error(`Can't find component ${schemaId} on this archetype ${arch.id}`);
  }

  const sSet = arch.entitiesSS;

  const denseInd = sSet.sparse[entity] as number | undefined;
  if (
    entity >= sSet.sparse.length ||
    denseInd === undefined ||
    denseInd >= sSet.dense.length ||
    sSet.dense[denseInd] !== entity
  ) {
    sSet.sparse[entity] = sSet.dense.length;
    sSet.dense.push(entity);
    switch (schema[$kind]) {
      case $tag:
        return true;
      case $aos:
        componentTable.push(component || Schema.default(schema));
        return true;
      case $soa:
        throw new Error('Not implemented');
      default:
        safeGuard(schema[$kind]);
    }
    return true;
  }

  switch (schema[$kind]) {
    case $tag:
      return true;
    case $aos:
      if (
        entity < sSet.sparse.length &&
        denseInd !== undefined &&
        denseInd < sSet.dense.length &&
        sSet.dense[denseInd] === entity
      ) {
        componentTable[denseInd] = component || Schema.default(schema);
        return true;
      }
      return false;
    case $soa:
      throw new Error('Not implemented');
    default:
      return safeGuard(schema[$kind]);
  }
}

// OK
export function componentsList<SL extends ReadonlyArray<Schema>, A extends Archetype<any>>(
  archetype: A,
  entity: Entity,
  ...schemas: A extends Archetype<infer iCL> ? (ArrayContains<iCL, SL> extends true ? SL : never) : never
) {
  return schemas.map((schema) => {
    const schemaId = Internals.getSchemaId(schema);
    const componentIndex = archetype.entitiesSS.sparse[entity];
    return archetype.table[schemaId][componentIndex];
  }) as {
    [K in keyof SL]: SchemaType<SL[K]>;
  };
}

// OK
export function component<S extends Schema, A extends Archetype<any>>(
  archetype: A,
  entity: Entity,
  component: A extends Archetype<infer iCL> ? (ArrayContains<iCL, [S]> extends true ? S : never) : never
) {
  const componentId = Internals.getSchemaId(component);
  const componentIndex = archetype.entitiesSS.sparse[entity];
  return archetype.table[componentId][componentIndex] as SchemaType<S>;
}

// OK
export const table = <S extends Schema, A extends Archetype<any>>(
  archetype: A,
  schema: A extends Archetype<infer iCL> ? (ArrayContains<iCL, [S]> extends true ? S : never) : never
) => {
  const componentId = Internals.getSchemaId(schema);
  return archetype.table[componentId] as ArchetypeTableRow<S>;
};

// OK
export const tablesList = <SL extends ReadonlyArray<Schema>, A extends Archetype<any>>(
  archetype: A,
  ...components: A extends Archetype<infer iCL> ? (ArrayContains<iCL, SL> extends true ? SL : never) : never
) => {
  return components.map((component) => {
    const componentId = Internals.getSchemaId(component);
    return archetype.table[componentId];
  }) as {
    [K in keyof SL]: SchemaType<SL[K]>[];
  };
};

export function newArchetype<SL extends Schema[]>(...schemas: SL) {
  const ss = SparseSet.new();
  const archId = ArchetypeId.create(schemas);
  const archetype: Archetype<SL> = {
    id: archId,
    type: schemas,
    entitiesSS: ss,
    entities: ss.dense,
    table: schemas.reduce((acc, schema) => {
      acc[Internals.getSchemaId(schema)] = [];
      return acc;
    }, [] as ArchetypeTable<SL>),
  };

  return archetype;
}

export const Archetype = {
  new: newArchetype,
  isSchemaInArchetype,
  isEntityInArchetype,
  componentsList,
  component,
  table,
  tablesList,
  setComponent: setArchetypeComponent,
  addEntity: addArchetypeEntity,
  removeEntity,
  moveEntity,
};

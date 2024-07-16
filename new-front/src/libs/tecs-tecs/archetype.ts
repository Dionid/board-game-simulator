import { Entity } from './core';
import { SparseSet } from './sparse-set';
import { Schema, SchemaType, SchemaId } from './schema';

export type ArchetypeTableRow<S extends Schema> = SchemaType<S>[];

export type ArchetypeTable<SL extends ReadonlyArray<Schema>> = {
  [K in keyof SL]: ArchetypeTableRow<SL[K]>;
};

export type Archetype<SL extends ReadonlyArray<Schema> = ReadonlyArray<Schema>> = {
  id: number;
  type: SL;
  entitiesSS: SparseSet;
  entities: number[]; // dense
  table: ArchetypeTable<SL>;
};

export const removeArchetypeEntity = <CL extends Schema[]>(
  arch: Archetype<CL>,
  entity: Entity
): {
  [K in keyof CL]: SchemaType<CL[K]>;
} => {
  // # Remove entity and component to archetype
  const sSet = arch.entitiesSS;

  const componentsData = [] as {
    [K in keyof CL]: SchemaType<CL[K]>;
  };

  const denseInd = sSet.sparse[entity];
  if (sSet.dense[denseInd] === entity && sSet.dense.length > 0) {
    const swapEntity = sSet.dense.pop()!;

    for (const componentTable of arch.table) {
      componentsData.push(componentTable[denseInd] as SchemaType<CL[number]>);
      const component = componentTable.pop()!;
      if (swapEntity !== entity) {
        componentTable[denseInd] = component;
      }
    }
    if (swapEntity !== entity) {
      sSet.dense[denseInd] = swapEntity;
      sSet.sparse[swapEntity] = denseInd;
    }
  }

  return componentsData;
};

export function isSchemaInArchetype(arch: Archetype<any>, schema: Schema): boolean;
export function isSchemaInArchetype(arch: Archetype<any>, schemaId: SchemaId): boolean;
export function isSchemaInArchetype(arch: Archetype<any>, schema: SchemaId | Schema): boolean {
  if (typeof schema === 'number') {
    return arch.table[schema] !== undefined;
  }

  return arch.type.includes(schema);
}

export const isEntityInArchetype = (arch: Archetype<any>, schemaId: SchemaId) => {
  return arch.table[schemaId] !== undefined;
};

export const Archetype = {
  isSchemaInArchetype,
  isEntityInArchetype,
  setComponent: <C extends Schema>(arch: Archetype<any>, entity: Entity, schemaId: SchemaId, props: SchemaType<C>) => {
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
      componentTable.push(props);
      return true;
    }

    if (
      entity < sSet.sparse.length &&
      denseInd !== undefined &&
      denseInd < sSet.dense.length &&
      sSet.dense[denseInd] === entity
    ) {
      componentTable[denseInd] = props;
      return true;
    }

    return false;
  },
  removeEntity: removeArchetypeEntity,
};

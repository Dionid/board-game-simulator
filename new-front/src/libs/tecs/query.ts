import { Archetype, isSchemaInArchetype } from './archetype';
import { Schema } from './schema';

export type Query<SL extends ReadonlyArray<Schema>> = {
  archetypes: Archetype<SL>[];
  schemas: SL;
};

export function tryAddArchetype<SL extends ReadonlyArray<Schema>>(query: Query<SL>, archetype: Archetype): boolean {
  if (
    !query.schemas.every((schema) => {
      return isSchemaInArchetype(archetype, schema);
    })
  ) {
    return false;
  }

  query.archetypes.push(archetype as Archetype<SL>);

  return true;
}

export const Query = {
  new: <SL extends ReadonlyArray<Schema>>(...schemas: SL): Query<SL> => {
    const archetypes: Archetype<SL>[] = [];

    return {
      archetypes,
      schemas,
    };
  },
  tryAddArchetype,
};

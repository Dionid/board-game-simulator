import { Archetype, isSchemaInArchetype } from './archetype.js';
import { Schema } from './schema.js';

export type Query<SL extends ReadonlyArray<Schema>> = {
  archetypes: Archetype<SL>[];
  tryAdd: (archetype: Archetype<SL>) => boolean;
};

export const Query = {
  new: <SL extends ReadonlyArray<Schema>>(...schemas: SL): Query<SL> => {
    const archetypes: Archetype<SL>[] = [];

    return {
      archetypes,
      tryAdd: (archetype: Archetype) => {
        if (
          !schemas.every((schema) => {
            return isSchemaInArchetype(archetype, schema);
          })
        ) {
          return false;
        }

        archetypes.push(archetype as Archetype<SL>);

        return true;
      },
    };
  },
};

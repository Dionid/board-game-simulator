import { Essence, newQuery, newSchema, number, registerQuery, System, table } from 'libs/tecs';

export type Mass = number;

export const Mass = newSchema({
  value: number,
});

const massQuery = newQuery(Mass);

export const resetMass = (essence: Essence): System => {
  const query = registerQuery(essence, massQuery);

  return () => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];

      const massT = table(archetype, Mass);

      for (let j = 0; j < archetype.entities.length; j++) {
        const mass = massT[j];

        mass.value = 0;
      }
    }
  };
};

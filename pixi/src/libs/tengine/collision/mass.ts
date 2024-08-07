import { newQuery, registerQuery, System, table } from 'libs/tecs';
import { ColliderBody } from './components';
import { Mass } from '../core';
import { Game } from '../game';

export const collisionBodyMass = newQuery(Mass, ColliderBody);

export const addCollisionMassToMass = (game: Game): System => {
  const query = registerQuery(game.essence, collisionBodyMass);

  return () => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];

      const massT = table(archetype, Mass);
      const colliderBodyT = table(archetype, ColliderBody);

      for (let j = 0; j < archetype.entities.length; j++) {
        const mass = massT[j];
        const colliderBody = colliderBodyT[j];

        for (const part of colliderBody.parts) {
          mass.value += part.mass;
        }
      }
    }
  };
};

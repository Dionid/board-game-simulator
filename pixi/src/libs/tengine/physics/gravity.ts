import { newQuery, newSchema, number, registerQuery, System, table } from 'libs/tecs';
import { Game } from '../game';
import { Vector2, Acceleration2 } from '../core';

export const AffectedByGravity = newSchema({
  scale: number,
});

export const affectedByGravityQuery = newQuery(AffectedByGravity, Acceleration2);

export const applyGravityToAcceleration = (game: Game, defaultGravity: Vector2): System => {
  const query = registerQuery(game.essence, affectedByGravityQuery);

  return ({ deltaTime }) => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];

      const accelerationT = table(archetype, Acceleration2);
      const affectedByGravityT = table(archetype, AffectedByGravity);

      for (let j = 0; j < archetype.entities.length; j++) {
        const acceleration = accelerationT[j];
        const affectedByGravity = affectedByGravityT[j];

        acceleration.x += defaultGravity.x * affectedByGravity.scale * deltaTime;
        acceleration.y += defaultGravity.y * affectedByGravity.scale * deltaTime;
      }
    }
  };
};

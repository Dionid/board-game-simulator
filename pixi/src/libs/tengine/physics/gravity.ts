import { newQuery, newSchema, number, registerQuery, System, table } from 'libs/tecs';
import { Game } from '../game';
import { Vector2, Acceleration2, Mass } from '../core';
import { Force2 } from './components';

export const AffectedByGravity = newSchema(
  {
    scale: number,
  },
  {
    name: 'AffectedByGravity',
  }
);

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

export const affectedByGravityWithForceQuery = newQuery(AffectedByGravity, Force2, Mass);

export const applyGravity = (game: Game, defaultGravity: Vector2): System => {
  const query = registerQuery(game.essence, affectedByGravityWithForceQuery);

  return ({ deltaTime }) => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];

      const forceT = table(archetype, Force2);
      const affectedByGravityT = table(archetype, AffectedByGravity);
      const massT = table(archetype, Mass);

      for (let j = 0; j < archetype.entities.length; j++) {
        const force = forceT[j];
        const affectedByGravity = affectedByGravityT[j];
        const mass = massT[j].value;

        force.x += defaultGravity.x * mass * affectedByGravity.scale * deltaTime;
        force.y += defaultGravity.y * mass * affectedByGravity.scale * deltaTime;
      }
    }
  };
};

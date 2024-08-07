import { newQuery, newSchema, number, registerQuery, System, table } from 'libs/tecs';
import { Game } from '../game';
import { Vector2, Acceleration2 } from '../core';
import { Force2, Impulse2 } from './components';

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

export const affectedByGravityWithForceQuery = newQuery(AffectedByGravity, Force2);

export const applyGravityAsForce = (game: Game, defaultGravity: Vector2): System => {
  const query = registerQuery(game.essence, affectedByGravityWithForceQuery);

  return ({ deltaTime }) => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];

      const forceT = table(archetype, Force2);
      const affectedByGravityT = table(archetype, AffectedByGravity);

      for (let j = 0; j < archetype.entities.length; j++) {
        const force = forceT[j];
        const affectedByGravity = affectedByGravityT[j];

        force.x += defaultGravity.x * affectedByGravity.scale * deltaTime;
        force.y += defaultGravity.y * affectedByGravity.scale * deltaTime;
      }
    }
  };
};

export const affectedByGravityWithImpulseQuery = newQuery(AffectedByGravity, Impulse2);

export const applyGravityAsImpulse = (game: Game, defaultGravity: Vector2): System => {
  const query = registerQuery(game.essence, affectedByGravityWithImpulseQuery);

  return ({ deltaTime }) => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];

      const impulseT = table(archetype, Impulse2);
      const affectedByGravityT = table(archetype, AffectedByGravity);

      for (let j = 0; j < archetype.entities.length; j++) {
        const impulse = impulseT[j];
        const affectedByGravity = affectedByGravityT[j];

        impulse.x += defaultGravity.x * affectedByGravity.scale * deltaTime;
        impulse.y += defaultGravity.y * affectedByGravity.scale * deltaTime;
      }
    }
  };
};

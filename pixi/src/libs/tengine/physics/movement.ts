import { newQuery, System, registerQuery, table, tryTable } from 'libs/tecs';
import { Acceleration2, Velocity2, Position2, Friction, DisableFriction } from '../core';
import { Game } from '../game';
import { RigidBody } from './components';

export const accelerationVelocityQuery = newQuery(RigidBody, Acceleration2, Velocity2);

export const applyRigidBodyAccelerationToVelocity = (game: Game): System => {
  const query = registerQuery(game.essence, accelerationVelocityQuery);

  return ({ deltaTime }) => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];
      const accelerationT = table(archetype, Acceleration2);
      const velocityT = table(archetype, Velocity2);

      for (let i = 0; i < archetype.entities.length; i++) {
        const acceleration = accelerationT[i];
        const velocity = velocityT[i];

        velocity.x += acceleration.x * deltaTime;
        velocity.y += acceleration.y * deltaTime;

        if (velocity.max > 0) {
          if (velocity.x > velocity.max) {
            velocity.x = velocity.max;
          } else if (velocity.x < -velocity.max) {
            velocity.x = -velocity.max;
          }

          if (velocity.y > velocity.max) {
            velocity.y = velocity.max;
          } else if (velocity.y < -velocity.max) {
            velocity.y = -velocity.max;
          }
        }
      }
    }
  };
};

// # Position

export const rigidBodyVelocityQuery = newQuery(RigidBody, Velocity2);

export const applyRigidBodyFriction = (game: Game, fixedFriction: number = 0): System => {
  const query = registerQuery(game.essence, rigidBodyVelocityQuery);

  return ({ deltaTime }) => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];
      const velocityT = table(archetype, Velocity2);
      const frictionT = tryTable(archetype, Friction);

      const disableFrictionT = tryTable(archetype, DisableFriction);

      if (disableFrictionT) {
        continue;
      }

      for (let j = 0; j < archetype.entities.length; j++) {
        const velocity = velocityT[j];
        let friction = frictionT ? frictionT[j].value : 0;

        const calculatedFriction = 1 - friction - fixedFriction;

        const appliedFriction = calculatedFriction < 0 ? 0 : calculatedFriction;

        velocity.x *= appliedFriction * deltaTime;
        velocity.y *= appliedFriction * deltaTime;
      }
    }
  };
};

export const velocityPositionQuery = newQuery(RigidBody, Velocity2, Position2);

export const applyRigidBodyVelocityToPosition = (game: Game): System => {
  const query = registerQuery(game.essence, velocityPositionQuery);

  return ({ deltaTime }) => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];
      const positionT = table(archetype, Position2);
      const velocityT = table(archetype, Velocity2);

      for (let j = 0; j < archetype.entities.length; j++) {
        const position = positionT[j];
        const velocity = velocityT[j];

        position.x += velocity.x * deltaTime;
        position.y += velocity.y * deltaTime;

        if (velocity.x < 0.01 && velocity.x > -0.01) {
          velocity.x = 0;
        }

        if (velocity.y < 0.01 && velocity.y > -0.01) {
          velocity.y = 0;
        }
      }
    }
  };
};

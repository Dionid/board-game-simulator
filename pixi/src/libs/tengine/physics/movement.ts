import { newQuery, System, registerQuery, table } from 'libs/tecs';
import { Acceleration2, Velocity2, Position2 } from '../core';
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

        if (!acceleration || !velocity) {
          continue;
        }

        velocity.x += acceleration.x * deltaTime;
        velocity.y += acceleration.y * deltaTime;
      }
    }
  };
};
// # Position

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

        // TODO: move add friction system
        velocity.x *= 0.9 * deltaTime;
        velocity.y *= 0.9 * deltaTime;

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

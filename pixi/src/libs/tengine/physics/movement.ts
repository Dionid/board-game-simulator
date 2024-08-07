import { newQuery, System, registerQuery, table, tryTable } from 'libs/tecs';
import { Acceleration2, Velocity2, Position2, Friction, DisableFriction, Mass } from '../core';
import { Game } from '../game';
import { Force2, Impulse2, RigidBody } from './components';

// # Acceleration = Force / Mass
export const forceAccelerationQuery = newQuery(RigidBody, Force2, Acceleration2, Mass);
export const applyRigidBodyForceToAcceleration = (game: Game): System => {
  const query = registerQuery(game.essence, forceAccelerationQuery);

  return ({ deltaTime }) => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];
      const accelerationT = table(archetype, Acceleration2);
      const forceT = table(archetype, Force2);
      const massT = table(archetype, Mass);

      for (let i = 0; i < archetype.entities.length; i++) {
        const acceleration = accelerationT[i];
        const force = forceT[i];
        const mass = massT[i].value;

        acceleration.x += force.x / mass;
        acceleration.y += force.y / mass;
      }
    }
  };
};

/**
 *
 * MUST BE AFTER IT APPLIED
 *
 */
export const resetForceQuery = newQuery(RigidBody, Force2);
export const resetForce = (game: Game): System => {
  const query = registerQuery(game.essence, resetForceQuery);

  return ({ deltaTime }) => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];
      const forceT = table(archetype, Force2);

      for (let i = 0; i < archetype.entities.length; i++) {
        const force = forceT[i];

        force.x = 0;
        force.y = 0;
      }
    }
  };
};

// # Velocity += Impulse / Mass
export const impulseVelocityQuery = newQuery(RigidBody, Impulse2, Velocity2, Mass);

export const applyRigidBodyImpulseToVelocity = (game: Game): System => {
  const query = registerQuery(game.essence, impulseVelocityQuery);

  return ({ deltaTime }) => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];
      const velocityT = table(archetype, Velocity2);
      const impulseT = table(archetype, Impulse2);
      const massT = table(archetype, Mass);

      for (let i = 0; i < archetype.entities.length; i++) {
        const velocity = velocityT[i];
        const impulse = impulseT[i];
        const mass = massT[i].value;

        velocity.x += impulse.x / mass;
        velocity.y += impulse.y / mass;

        // TODO: MOVE
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

/**
 *
 * MUST BE AFTER IT APPLIED
 *
 */
export const resetImpulseQuery = newQuery(RigidBody, Impulse2);
export const resetImpulse = (game: Game): System => {
  const query = registerQuery(game.essence, resetImpulseQuery);

  return ({ deltaTime }) => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];
      const impulseT = table(archetype, Impulse2);

      for (let i = 0; i < archetype.entities.length; i++) {
        const impulse = impulseT[i];

        impulse.x = 0;
        impulse.y = 0;
      }
    }
  };
};

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

        // TODO: MOVE
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

import { componentByEntity, newQuery, registerQuery, registerTopic, System, table } from '../../tecs';
import { Game } from '../game';
import { Acceleration, Position, Velocity } from '../ecs';
import { willCollideTopic } from '../collision';

export const accelerationVelocityQuery = newQuery(Acceleration, Velocity);

export const applyAccelerationToVelocity = (game: Game): System => {
  const query = registerQuery(game.essence, accelerationVelocityQuery);

  return ({ deltaTime }) => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];
      const accelerationT = table(archetype, Acceleration);
      const velocityT = table(archetype, Velocity);

      for (let i = 0; i < archetype.entities.length; i++) {
        const acceleration = accelerationT[i];
        const velocity = velocityT[i];

        if (!acceleration || !velocity) {
          continue;
        }

        velocity.x += acceleration.x * deltaTime;
        velocity.y += acceleration.y * deltaTime;

        // TODO: move it friction
        velocity.x *= 0.85 * deltaTime;
        velocity.y *= 0.85 * deltaTime;
      }
    }
  };
};

// # Resolve

export const resolveCollision = (game: Game): System => {
  const topic = registerTopic(game.essence, willCollideTopic);

  return () => {
    for (const event of topic) {
      // debugger;
      const { a, b } = event;

      const aAcceleration = componentByEntity(game.essence, a.entity, Acceleration);
      const aVelocity = componentByEntity(game.essence, a.entity, Velocity);
      const aPosition = componentByEntity(game.essence, a.entity, Position);

      const bAcceleration = componentByEntity(game.essence, b.entity, Acceleration);
      const bVelocity = componentByEntity(game.essence, b.entity, Velocity);
      const bPosition = componentByEntity(game.essence, b.entity, Position);

      if (!aAcceleration || !bAcceleration || !aVelocity || !bVelocity || !aPosition || !bPosition) {
        continue;
      }

      aAcceleration.x *= -1;
      aAcceleration.y *= -1;
      bAcceleration.x *= -1;
      bAcceleration.y *= -1;

      aVelocity.x = 0;
      aVelocity.y = 0;
      bVelocity.x = 0;
      bVelocity.y = 0;
    }
  };
};

// # Position

export const velocityPositionQuery = newQuery(Velocity, Position);

export const applyVelocityToPosition = (game: Game): System => {
  const query = registerQuery(game.essence, velocityPositionQuery);

  return ({ deltaTime }) => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];
      const positionT = table(archetype, Position);
      const velocityT = table(archetype, Velocity);

      for (let j = 0; j < archetype.entities.length; j++) {
        const position = positionT[j];
        const velocity = velocityT[j];

        position.x += velocity.x * deltaTime;
        position.y += velocity.y * deltaTime;

        // TODO: MOVE IT
      }
    }
  };
};

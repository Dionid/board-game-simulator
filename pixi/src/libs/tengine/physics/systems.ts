import {
  componentByEntity,
  newQuery,
  registerQuery,
  registerTopic,
  System,
  table,
  tryTable,
} from '../../tecs';
import { Game } from '../game';
import { Acceleration2, Position2, Size2, Velocity2 } from '../core/components';
import { ColliderSet, colliding } from '../collision';
import { Dynamic, Kinematic, Static } from './components';
import { resolveKinematicAndStaticOverlap } from './resolve';

export const accelerationVelocityQuery = newQuery(Acceleration2, Velocity2);

export const applyAccelerationToVelocity = (game: Game): System => {
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

        // TODO: move it friction
        velocity.x *= 0.85 * deltaTime;
        velocity.y *= 0.85 * deltaTime;
      }
    }
  };
};

// # Resolve

export const resolveCollision = (game: Game): System => {
  const topic = registerTopic(game.essence, colliding);

  return () => {
    for (const event of topic) {
      const { a, b } = event;

      // # Emit collision started event
      // QUESTION: if collision was with sensor collider, than somehow need to determine
      // is it "started", "active" or "ended" collision
      // emit(
      //   collideStartedTopic,
      //   {
      //     name: 'collisionStarted',
      //     a: {
      //       entity: a.entity,
      //       colliderSet: a.colliderSet,
      //       collider: a.collider,
      //     },
      //     b: {
      //       entity: b.entity,
      //       colliderSet: b.colliderSet,
      //       collider: b.collider,
      //     },
      //   },
      //   true
      // );

      const aPosition = componentByEntity(game.essence, a.entity, Position2);
      const aSize = componentByEntity(game.essence, a.entity, Size2);

      const bPosition = componentByEntity(game.essence, b.entity, Position2);
      const bSize = componentByEntity(game.essence, b.entity, Size2);

      if (!aPosition || !bPosition || !aSize || !bSize) {
        continue;
      }

      // # Determine type of colliders
      const aSolid = a.collider.type === 'solid';
      const aSensor = a.collider.type === 'sensor';

      const bSolid = b.collider.type === 'solid';
      const bSensor = b.collider.type === 'sensor';

      // # Skip physics if it is sensor
      if (aSensor || bSensor) {
        continue;
      }

      // # Both must be solid
      if (aSolid === undefined || bSolid === undefined) {
        continue;
      }

      // # Determine the type of bodies
      const aStatic = componentByEntity(game.essence, a.entity, Static);
      const aKinematic = componentByEntity(game.essence, a.entity, Kinematic);
      const aDynamic = componentByEntity(game.essence, a.entity, Dynamic);

      const bStatic = componentByEntity(game.essence, b.entity, Static);
      const bKinematic = componentByEntity(game.essence, b.entity, Kinematic);
      const bDynamic = componentByEntity(game.essence, b.entity, Dynamic);

      // # If not any of types, skip
      if (
        aStatic === undefined &&
        bStatic === undefined &&
        aKinematic === undefined &&
        bKinematic === undefined &&
        aDynamic === undefined &&
        bDynamic === undefined
      ) {
        continue;
      }

      // # Don't apply physics to kinematic and static bodies collision
      if (
        (aStatic && bStatic) ||
        (aKinematic && bKinematic) ||
        (aKinematic && bStatic) ||
        (aStatic && bKinematic)
      ) {
        continue;
      }

      // TODO: # Dynamic bodies collision response
      // ...
    }
  };
};

// # Position

export const velocityPositionQuery = newQuery(Velocity2, Position2);

export const applyVelocityToPosition = (game: Game): System => {
  const query = registerQuery(game.essence, velocityPositionQuery);

  return ({ deltaTime }) => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];
      const positionT = table(archetype, Position2);
      const velocityT = table(archetype, Velocity2);

      for (let j = 0; j < archetype.entities.length; j++) {
        const position = positionT[j];
        const velocity = velocityT[j];

        const newXPosition = position.x + velocity.x * deltaTime;
        const newYPosition = position.y + velocity.y * deltaTime;

        position.x = newXPosition;
        position.y = newYPosition;
      }
    }
  };
};

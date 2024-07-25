import { componentByEntity, emit, newQuery, registerQuery, registerTopic, System, table, tryTable } from '../../tecs';
import { Game } from '../game';
import { Acceleration, Position, Size, Velocity } from '../ecs';
import { ColliderSet, collideStartedTopic, colliding } from '../collision';
import { Dynamic, Kinematic, Static } from './components';
import { resolveOverlap } from './resolve';

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
  const topic = registerTopic(game.essence, colliding);

  return () => {
    for (const event of topic) {
      const { a, b } = event;

      const aPosition = componentByEntity(game.essence, a.entity, Position);
      const aVelocity = componentByEntity(game.essence, a.entity, Velocity);
      const aSize = componentByEntity(game.essence, a.entity, Size);

      const bPosition = componentByEntity(game.essence, b.entity, Position);
      const bVelocity = componentByEntity(game.essence, b.entity, Velocity);
      const bSize = componentByEntity(game.essence, b.entity, Size);

      if (!aPosition || !bPosition || !aSize || !bSize) {
        continue;
      }

      // # Determine type of colliders
      const aSolid = a.collider.type === 'solid';
      const aSensor = a.collider.type === 'sensor';

      const bSolid = b.collider.type === 'solid';
      const bSensor = b.collider.type === 'sensor';

      // # Fix position if both solid
      if (aSolid && bSolid) {
        // TODO: need to rewrite this
        // resolveOverlap(
        //   a.collider.shape.name,
        //   a.collidingPosition,
        //   aSize,
        //   aVelocity ?? {
        //     x: 0,
        //     y: 0,
        //   },
        //   b.collider.shape.name,
        //   b.collidingPosition,
        //   bSize,
        //   bVelocity ?? {
        //     x: 0,
        //     y: 0,
        //   }
        // );
        // aPosition.x = a.collidingPosition.x;
        // aPosition.y = a.collidingPosition.y;
        // bPosition.x = b.collidingPosition.x;
        // bPosition.y = b.collidingPosition.y;
      }

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

      // # Skip physics if it is sensor
      if (aSensor || bSensor) {
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
      if (!aStatic && !bStatic && !aKinematic && !bKinematic && !aDynamic && !bDynamic) {
        continue;
      }

      // # Don't apply physics to kinematic bodies collision
      if (aStatic && bStatic) {
        continue;
      }

      // # Don't apply physics to kinematic bodies collision
      if (aKinematic && bKinematic) {
        continue;
      }

      // # Don't apply physics to kinematic and static bodies collision
      if ((aKinematic && bStatic) || (aStatic && bKinematic)) {
        continue;
      }

      // TODO: # Dynamic bodies collision response
      // ...

      // TODO: MOVE THIS
      // if (!aVelocity || !bVelocity || !aPosition || !bPosition) {
      //   continue;
      // }

      // aVelocity.x *= -1;
      // aVelocity.y *= -1;
      // bVelocity.x *= -1;
      // bVelocity.y *= -1;
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

      const colliderSetT = tryTable(archetype, ColliderSet);

      for (let j = 0; j < archetype.entities.length; j++) {
        const position = positionT[j];
        const velocity = velocityT[j];

        const newXPosition = position.x + velocity.x * deltaTime;
        const newYPosition = position.y + velocity.y * deltaTime;

        position.x = newXPosition;
        position.y = newYPosition;

        if (!colliderSetT) {
          continue;
        }

        const colliderSet = colliderSetT[j];

        if (!colliderSet) {
          continue;
        }

        for (const collider of colliderSet.list) {
          collider.position.x = newXPosition + collider.offset.x;
          collider.position.y = newYPosition + collider.offset.y;
        }
      }
    }
  };
};
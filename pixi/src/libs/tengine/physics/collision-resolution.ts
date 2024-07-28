import { componentByEntity, registerTopic, System } from '../../tecs';
import { Game } from '../game';
import { Position2 } from '../core/types';
import { colliding, resolvePenetration } from '../collision';
import { Dynamic, Kinematic, Static } from './components';
import { dotV2, multScalarV2, mutAddV2, normalizeV2, subV2, Velocity2 } from '../core';

// # Resolve Dynamic bodies Collision

export const dynamicRigidBodyCollisionResolution = (game: Game): System => {
  const topic = registerTopic(game.essence, colliding);

  return () => {
    for (const event of topic) {
      const { a, b, depth } = event;

      // # Skip physics if both are sensors
      if (a.collider.type === 'sensor' || b.collider.type === 'sensor') {
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
        (aStatic === undefined && aDynamic === undefined && aKinematic === undefined) ||
        (bStatic === undefined && bDynamic === undefined && bKinematic === undefined)
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

      const aPosition = componentByEntity(game.essence, a.entity, Position2);
      const bPosition = componentByEntity(game.essence, b.entity, Position2);

      if (!aPosition || !bPosition) {
        continue;
      }

      const aVelocity = componentByEntity(game.essence, a.entity, Velocity2);
      const bVelocity = componentByEntity(game.essence, b.entity, Velocity2);

      if (!aVelocity || !bVelocity) {
        continue;
      }

      // # Dynamic bodies collision response

      // # Resolve penetration
      resolvePenetration(
        aPosition,
        aDynamic === undefined,
        a.collider.shape,
        bPosition,
        bDynamic === undefined,
        b.collider.shape,
        depth
      );

      // ## Dynamic vs Static or Kinematic
      if ((aDynamic && (bStatic || bKinematic)) || (bDynamic && (aStatic || aKinematic))) {
        continue;
      }

      // ## Dynamic vs Dynamic

      if (a.collider.shape.type === 'circle' && b.collider.shape.type === 'circle') {
        const normalizedPosition = normalizeV2(subV2(aPosition, bPosition));

        const relativeVelocity = subV2(aVelocity, bVelocity);

        const velocitySeparation = dotV2(relativeVelocity, normalizedPosition);

        const newSepVelocity = -velocitySeparation;
        const separationVelocityVector = multScalarV2(normalizedPosition, newSepVelocity);

        mutAddV2(aVelocity, separationVelocityVector);
        mutAddV2(bVelocity, multScalarV2(separationVelocityVector, -1));

        continue;
      }
    }
  };
};

import { componentByEntity, registerTopic, System } from '../../tecs';
import { Game } from '../game';
import { Position2 } from '../core/types';
import { Impenetrable, resolvePenetration, internalColliding } from '../collision';
import { Dynamic, Kinematic, RigidBody, Static } from './components';
import { dotV2, multV2, subV2, Velocity2 } from '../core';
import { inverseMass } from '../collision/math';
import { safeGuard } from 'libs/tecs/switch';

// # Resolve Dynamic bodies Collision

export const dynamicRigidBodyCollisionResolution = (game: Game): System => {
  // const topic = registerTopic(game.essence, unfilteredColliding);
  const topic = registerTopic(game.essence, internalColliding);

  return () => {
    for (const event of topic) {
      const { a, b, overlap, axis } = event;

      // # Skip physics if both are sensors
      if (a.collider.type === 'sensor' || b.collider.type === 'sensor') {
        continue;
      }

      const aRigidBody = componentByEntity(game.essence, a.entity, RigidBody);
      const bRigidBody = componentByEntity(game.essence, b.entity, RigidBody);

      // # Skip if no rigid body
      if (!aRigidBody || !bRigidBody) {
        continue;
      }

      const aImpenetrable = componentByEntity(game.essence, a.entity, Impenetrable);
      const bImpenetrable = componentByEntity(game.essence, b.entity, Impenetrable);

      // # Collision resolution delegated to collision penetration resolution system
      if (aImpenetrable || bImpenetrable) {
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

      // # Resolve penetration
      resolvePenetration(axis, overlap, a.colliderSet, aPosition, b.colliderSet, bPosition, {
        aMass: aDynamic ? undefined : 0, // force 0 mass for not Dynamic
        bMass: bDynamic ? undefined : 0, // force 0 mass for not Dynamic
      });

      let aVelocity = componentByEntity(game.essence, a.entity, Velocity2);
      if (!aVelocity) {
        aVelocity = { x: 0, y: 0, max: 0 };
      }

      let bVelocity = componentByEntity(game.essence, b.entity, Velocity2);
      if (!bVelocity) {
        bVelocity = { x: 0, y: 0, max: 0 };
      }

      // # Dynamic vs Dynamic
      const elasticityMode =
        aRigidBody.elasticityMode === 'max' || bRigidBody.elasticityMode === 'max'
          ? 'max'
          : aRigidBody.elasticityMode === 'multiply' || bRigidBody.elasticityMode === 'multiply'
          ? 'multiply'
          : aRigidBody.elasticityMode === 'min' || bRigidBody.elasticityMode === 'min'
          ? 'min'
          : 'average';

      let elasticity;

      switch (elasticityMode) {
        case 'max':
          elasticity = Math.max(aRigidBody.elasticity, bRigidBody.elasticity);
          break;
        case 'min':
          elasticity = Math.min(aRigidBody.elasticity, bRigidBody.elasticity);
          break;
        case 'multiply':
          elasticity = aRigidBody.elasticity * bRigidBody.elasticity;
          break;
        case 'average':
          elasticity = (aRigidBody.elasticity + bRigidBody.elasticity) / 2;
          break;
        default:
          return safeGuard(elasticityMode);
      }

      // # If there is no elasticity, skip
      if (elasticity === 0) {
        continue;
      }

      let aTotalMass = 0;
      if (aDynamic) {
        for (let i = 0; i < a.colliderSet.parts.length; i++) {
          aTotalMass += a.colliderSet.parts[i].mass;
        }
      }
      let bTotalMass = 0;
      if (bDynamic) {
        for (let i = 0; i < b.colliderSet.parts.length; i++) {
          bTotalMass += b.colliderSet.parts[i].mass;
        }
      }
      const aInvertedTotalMass = inverseMass(aTotalMass);
      const bInvertedTotalMass = inverseMass(bTotalMass);
      const combinedInvertedMass = aTotalMass + bTotalMass;

      // # If both bodies have infinite mass, skip
      if (combinedInvertedMass === 0) {
        continue;
      }

      // # Relative direction vector from a to b
      const normalizedDirection = axis;

      // # Velocity Separation
      const velocitySeparation = dotV2(subV2(aVelocity, bVelocity), normalizedDirection);
      const velocitySeparationWithElasticity = -1 * velocitySeparation * elasticity;
      const velocitySeparationDiff = velocitySeparationWithElasticity - velocitySeparation;

      // # Impulse
      const impulse = velocitySeparationDiff / combinedInvertedMass;
      const impulseVector = multV2(normalizedDirection, impulse);

      // # Change velocity
      aVelocity.x += impulseVector.x * aInvertedTotalMass;
      aVelocity.y += impulseVector.y * aInvertedTotalMass;

      bVelocity.x -= impulseVector.x * bInvertedTotalMass;
      bVelocity.y -= impulseVector.y * bInvertedTotalMass;
    }
  };
};

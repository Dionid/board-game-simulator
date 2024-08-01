import { componentByEntity, registerTopic, System } from '../../tecs';
import { Game } from '../game';
import { Position2 } from '../core/types';
import { unfilteredColliding, Impenetrable, resolvePenetration } from '../collision';
import { Dynamic, Kinematic, RigidBody, Static } from './components';
import { dotV2, multV2, normalizeV2, subV2, Velocity2 } from '../core';
import { inverseMass } from '../collision/math';
import { safeGuard } from 'libs/tecs/switch';
import { resolveCircleCircleCollision, resolveCircleLineCollision } from './resolvers';

// # Resolve Dynamic bodies Collision

export const dynamicRigidBodyCollisionResolution = (game: Game): System => {
  const topic = registerTopic(game.essence, unfilteredColliding);

  return () => {
    for (const event of topic) {
      const { a, b, overlap: depth } = event;

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

      // # Dynamic bodies collision response

      const aMass = aStatic || aKinematic ? 0 : a.collider.mass;
      const bMass = bStatic || bKinematic ? 0 : b.collider.mass;

      // # Resolve penetration
      resolvePenetration(
        aPosition,
        aMass,
        a.collider.shape,
        bPosition,
        bMass,
        b.collider.shape,
        depth
      );

      // ## Dynamic vs Static or Kinematic
      if ((aDynamic && (bStatic || bKinematic)) || (bDynamic && (aStatic || aKinematic))) {
        continue;
      }

      const aVelocity = componentByEntity(game.essence, a.entity, Velocity2);
      const bVelocity = componentByEntity(game.essence, b.entity, Velocity2);

      if (!aVelocity || !bVelocity) {
        continue;
      }

      // ## Dynamic vs Dynamic

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

      const aInvertedMass = inverseMass(aMass);
      const bInvertedMass = inverseMass(bMass);
      const combinedInvertedMass = aInvertedMass + bInvertedMass;

      // # If both bodies have infinite mass, skip
      if (combinedInvertedMass === 0) {
        continue;
      }

      switch (a.collider.shape.type) {
        case 'circle':
          switch (b.collider.shape.type) {
            case 'circle':
              resolveCircleCircleCollision(
                elasticity,
                aPosition,
                aVelocity,
                aInvertedMass,
                bPosition,
                bVelocity,
                bInvertedMass,
                combinedInvertedMass
              );
              continue;
            case 'rectangle':
              continue;
            case 'line':
              resolveCircleLineCollision(
                elasticity,
                aPosition,
                aVelocity,
                aInvertedMass,
                bPosition,
                {
                  x: bPosition.x,
                  y: bPosition.y + b.collider.shape.length,
                },
                bVelocity,
                bInvertedMass,
                combinedInvertedMass
              );
              continue;
            default:
              return safeGuard(b.collider.shape);
          }
        case 'rectangle':
          continue;
        case 'line':
          switch (b.collider.shape.type) {
            case 'circle':
              resolveCircleLineCollision(
                elasticity,
                bPosition,
                bVelocity,
                bInvertedMass,
                aPosition,
                {
                  x: aPosition.x,
                  y: aPosition.y + a.collider.shape.length,
                },
                aVelocity,
                aInvertedMass,
                combinedInvertedMass
              );
              continue;
            case 'rectangle':
              continue;
            case 'line':
              continue;
            default:
              return safeGuard(b.collider.shape);
          }
        default:
          return safeGuard(a.collider.shape);
      }
    }
  };
};

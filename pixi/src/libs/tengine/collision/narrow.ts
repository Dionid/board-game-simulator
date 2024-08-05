import { newQuery, registerQuery, Entity, KindToType, System, table, emit } from '../../tecs';
import { Position2 } from '../core/types';
import { Game } from '../game';
import { Awaken, Collider, ColliderBody, CollisionsMonitoring } from './components';
import { internalUnfilteredColliding } from './topics';
import { collides, CollisionResult } from './collision';
import { Archetype } from 'libs/tecs/archetype';

// 1. Get all entities that have CollisionSource + ColliderSet + Position (+ Awaken)
// 1. Calculate the next position based on the current position + velocity
// 1. Check if the next position collides with any other ColliderSet
// 1. If collides create event

export const checkAwakenCollisionsQuery = newQuery(
  CollisionsMonitoring,
  Awaken,
  ColliderBody,
  Position2
);
export const checkCollisionsQuery = newQuery(CollisionsMonitoring, ColliderBody, Position2);
export const collidersQuery = newQuery(ColliderBody, Position2);

export const checkNarrowCollisionSimple = (game: Game, awakened: boolean = true): System => {
  const forCheckQ = awakened
    ? registerQuery(game.essence, checkAwakenCollisionsQuery)
    : registerQuery(game.essence, checkCollisionsQuery);

  const allCollidersQ = registerQuery(game.essence, collidersQuery);

  return () => {
    const forCheckColliders: {
      entity: Entity;
      colliderSet: KindToType<typeof ColliderBody>;
      position: KindToType<typeof Position2>;
      archetype: Archetype;
    }[] = [];

    for (let i = 0; i < forCheckQ.archetypes.length; i++) {
      const archetype = forCheckQ.archetypes[i];

      const colliderSetT = table(archetype, ColliderBody);
      const positionT = table(archetype, Position2);

      for (let i = 0; i < archetype.entities.length; i++) {
        const entity = archetype.entities[i];

        const colliderSet = colliderSetT[i];
        const position = positionT[i];

        forCheckColliders.push({
          entity,
          colliderSet,
          position,
          archetype,
        });
      }
    }

    if (forCheckColliders.length === 0) {
      return;
    }

    for (let i = 0; i < allCollidersQ.archetypes.length; i++) {
      const bArchetype = allCollidersQ.archetypes[i];

      const colliderSetTB = table(bArchetype, ColliderBody);

      for (let a = 0; a < forCheckColliders.length; a++) {
        const aArchetype = forCheckColliders[a].archetype;
        const entityA = forCheckColliders[a].entity;
        const colliderSetA = forCheckColliders[a].colliderSet;

        for (let i = 0; i < bArchetype.entities.length; i++) {
          const entityB = bArchetype.entities[i];

          if (entityA === entityB) {
            continue;
          }

          const colliderSetB = colliderSetTB[i];

          const partsCollisionList: (CollisionResult & {
            acId: number;
            bcId: number;
            aCollider: KindToType<typeof Collider>;
            bCollider: KindToType<typeof Collider>;
          })[] = [];

          for (let acId = 0; acId < colliderSetA.parts.length; acId++) {
            const aCollider = colliderSetA.parts[acId];

            for (let bcId = 0; bcId < colliderSetB.parts.length; bcId++) {
              const bCollider = colliderSetB.parts[bcId];

              const result = collides(aCollider, bCollider);

              if (result && result.overlap >= 0) {
                partsCollisionList.push({
                  overlap: result.overlap,
                  axis: result.axis,
                  aCollider,
                  bCollider,
                  acId: acId,
                  bcId: bcId,
                });
              }
            }
          }

          let minCollision = partsCollisionList[0];

          for (let i = 1; i < partsCollisionList.length; i++) {
            const partCollision = partsCollisionList[i];
            if (partCollision.overlap < minCollision.overlap) {
              minCollision = partCollision;
            }
          }

          // zero is correct value, -1 and less must be ignored
          if (minCollision && minCollision.overlap >= 0) {
            emit(
              internalUnfilteredColliding,
              {
                name: 'colliding',
                overlap: minCollision.overlap,
                axis: minCollision.axis,
                a: {
                  archetype: aArchetype,
                  entity: entityA,
                  colliderSet: colliderSetA,
                  collider: minCollision.aCollider,
                  colliderId: minCollision.acId,
                },
                b: {
                  archetype: bArchetype,
                  entity: entityB,
                  colliderSet: colliderSetB,
                  collider: minCollision.bCollider,
                  colliderId: minCollision.bcId,
                },
              },
              true
            );
          }
        }
      }
    }
  };
};

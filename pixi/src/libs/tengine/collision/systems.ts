import { newQuery, registerQuery, Entity, KindToType, System, table, emit } from '../../tecs';
import { Position2 } from '../core/components';
import { Game } from '../game';
import { compareColliders } from './checks';
import { ColliderSet, ActiveCollisions } from './components';
import { colliding } from './topics';

// 1. Get all entities that have CollisionSource + ColliderSet + Position (+ Awaken)
// 1. Calculate the next position based on the current position + velocity
// 1. Check if the next position collides with any other ColliderSet
// 1. If collides create event

export const checkCollisionsQuery = newQuery(ActiveCollisions, ColliderSet, Position2);
export const collidersQuery = newQuery(ColliderSet, Position2);

export const checkNarrowCollisionSimple = (game: Game): System => {
  const forCheckQ = registerQuery(game.essence, checkCollisionsQuery);
  const allCollidersQ = registerQuery(game.essence, collidersQuery);

  return () => {
    const forCheckColliders: {
      entity: Entity;
      colliderSet: KindToType<typeof ColliderSet>;
      position: KindToType<typeof Position2>;
    }[] = [];

    for (let i = 0; i < forCheckQ.archetypes.length; i++) {
      const archetype = forCheckQ.archetypes[i];

      const colliderSetT = table(archetype, ColliderSet);
      const positionT = table(archetype, Position2);

      for (let i = 0; i < archetype.entities.length; i++) {
        const entity = archetype.entities[i];

        const colliderSet = colliderSetT[i];
        const position = positionT[i];

        forCheckColliders.push({
          entity,
          colliderSet,
          position,
        });
      }
    }

    if (forCheckColliders.length === 0) {
      return;
    }

    for (let i = 0; i < allCollidersQ.archetypes.length; i++) {
      const archetype = allCollidersQ.archetypes[i];

      const colliderSetTB = table(archetype, ColliderSet);

      for (let a = 0; a < forCheckColliders.length; a++) {
        const entityA = forCheckColliders[a].entity;
        const colliderSetA = forCheckColliders[a].colliderSet;

        for (let i = 0; i < archetype.entities.length; i++) {
          const entityB = archetype.entities[i];

          if (entityA === entityB) {
            continue;
          }

          const colliderSetB = colliderSetTB[i];

          for (const colliderA of colliderSetA.list) {
            for (const colliderB of colliderSetB.list) {
              const depth = compareColliders(colliderA, colliderB);

              if (depth >= 0) {
                emit(
                  colliding,
                  {
                    name: 'colliding',
                    depth,
                    a: {
                      entity: entityA,
                      colliderSet: colliderSetA,
                      collider: colliderA,
                    },
                    b: {
                      entity: entityB,
                      colliderSet: colliderSetB,
                      collider: colliderB,
                    },
                  },
                  true
                );
              }
            }
          }
        }
      }
    }
  };
};

export const positionColliderSetQuery = newQuery(ColliderSet, Position2);

export const applyPositionToCollider = (game: Game): System => {
  const query = registerQuery(game.essence, positionColliderSetQuery);

  return () => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];

      const colliderSetT = table(archetype, ColliderSet);
      const positionT = table(archetype, Position2);

      for (let j = 0; j < archetype.entities.length; j++) {
        const colliderSet = colliderSetT[j];
        const position = positionT[j];

        for (const collider of colliderSet.list) {
          collider.position.x = position.x + collider.offset.x;
          collider.position.y = position.y + collider.offset.y;
        }
      }
    }
  };
};

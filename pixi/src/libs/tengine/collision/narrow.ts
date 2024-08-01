import { newQuery, registerQuery, Entity, KindToType, System, table, emit } from '../../tecs';
import { Position2 } from '../core/types';
import { Game } from '../game';
import { ColliderSet, CollisionsMonitoring } from './components';
import { unfilteredColliding } from './topics';
import { collision } from './collision';

// 1. Get all entities that have CollisionSource + ColliderSet + Position (+ Awaken)
// 1. Calculate the next position based on the current position + velocity
// 1. Check if the next position collides with any other ColliderSet
// 1. If collides create event

export const checkCollisionsQuery = newQuery(CollisionsMonitoring, ColliderSet, Position2);
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
              let result = collision(colliderA, colliderB);

              if (result && result.overlap >= 0) {
                // console.log('colliding', result.axis);
                emit(
                  unfilteredColliding,
                  {
                    name: 'colliding',
                    overlap: result.overlap,
                    axis: result.axis,
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

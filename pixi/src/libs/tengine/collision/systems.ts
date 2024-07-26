import {
  newQuery,
  registerQuery,
  Entity,
  KindToType,
  System,
  table,
  emit,
  tryTable,
} from '../../tecs';
import { Position2 } from '../core/components';
import { Game } from '../game';
import { compareColliders } from './checks';
import { ColliderSet, ActiveCollisions } from './components';
import { colliding } from './topics';

// 1. Get all entities that have CollisionSource + ColliderSet + Position (+ Awaken)
// 1. Calculate the next position based on the current position + velocity
// 1. Check if the next position collides with any other ColliderSet
// 1. If collides create event

const EPSILON = 1.0e-6;

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

// export const checkNarrowCollisionBasedOnFutureSimple = (game: Game): System => {
//   const forCheckQ = registerQuery(game.essence, checkCollisionsQuery);
//   const allCollidersQ = registerQuery(game.essence, collidersQuery);

//   return ({ deltaTime }) => {
//     const forCheckColliders: {
//       entity: Entity;
//       colliderSet: SchemaType<typeof ColliderSet>;
//       position: SchemaType<typeof Position>;
//       velocity: SchemaType<typeof Velocity>;
//     }[] = [];

//     for (let i = 0; i < forCheckQ.archetypes.length; i++) {
//       const archetype = forCheckQ.archetypes[i];

//       const colliderSetT = table(archetype, ColliderSet);
//       const positionT = table(archetype, Position);
//       const velocityT = tryTable(archetype, Velocity);

//       for (let i = 0; i < archetype.entities.length; i++) {
//         const entity = archetype.entities[i];

//         const colliderSet = colliderSetT[i];
//         const position = positionT[i];
//         const velocity = velocityT
//           ? velocityT[i]
//           : {
//               x: 0,
//               y: 0,
//             };

//         forCheckColliders.push({
//           entity,
//           colliderSet,
//           position,
//           velocity,
//         });
//       }
//     }

//     if (forCheckColliders.length === 0) {
//       return;
//     }

//     for (let i = 0; i < allCollidersQ.archetypes.length; i++) {
//       const archetype = allCollidersQ.archetypes[i];

//       const colliderSetTB = table(archetype, ColliderSet);
//       const positionTB = table(archetype, Position);
//       const velocityTB = tryTable(archetype, Velocity);

//       for (let a = 0; a < forCheckColliders.length; a++) {
//         const entityA = forCheckColliders[a].entity;
//         const colliderSetA = forCheckColliders[a].colliderSet;
//         const positionA = forCheckColliders[a].position;
//         const velocityA = forCheckColliders[a].velocity;

//         const colliderSetNewPositionA = {
//           x: positionA.x + velocityA.x * deltaTime,
//           y: positionA.y + velocityA.y * deltaTime,
//         };

//         for (let i = 0; i < archetype.entities.length; i++) {
//           const entityB = archetype.entities[i];

//           if (entityA === entityB) {
//             continue;
//           }

//           const colliderSetB = colliderSetTB[i];
//           const positionB = positionTB[i];
//           const velocityB = velocityTB
//             ? velocityTB[i]
//             : {
//                 x: 0,
//                 y: 0,
//               };

//           const colliderSetNewPositionB = {
//             x: positionB.x + velocityB.x * deltaTime,
//             y: positionB.y + velocityB.y * deltaTime,
//           };

//           for (const colliderA of colliderSetA.list) {
//             const colliderNewPositionA = {
//               x: colliderA.position.x + colliderSetNewPositionA.x,
//               y: colliderA.position.y + colliderSetNewPositionA.y,
//             };

//             for (const colliderB of colliderSetB.list) {
//               const colliderNewPositionB = {
//                 x: colliderB.position.x + colliderSetNewPositionB.x,
//                 y: colliderB.position.y + colliderSetNewPositionB.y,
//               };

//               const overlap = compareColliders(
//                 {
//                   ...colliderA,
//                   position: colliderNewPositionA,
//                 },
//                 {
//                   ...colliderB,
//                   position: colliderNewPositionB,
//                 }
//               );

//               if (overlap >= 0) {
//                 emit(
//                   willCollideTopic,
//                   {
//                     name: 'willCollide',
//                     a: {
//                       entity: entityA,
//                       colliderSet: colliderSetA,
//                       collider: colliderA,
//                       collidingPosition: colliderSetNewPositionA,
//                       overlap,
//                     },
//                     b: {
//                       entity: entityB,
//                       colliderSet: colliderSetB,
//                       collider: colliderB,
//                       collidingPosition: colliderSetNewPositionB,
//                       overlap,
//                     },
//                   },
//                   true
//                 );
//               }
//             }
//           }
//         }
//       }
//     }
//   };
// };

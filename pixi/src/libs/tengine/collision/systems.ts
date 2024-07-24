import { newQuery, registerQuery, Entity, SchemaType, System, table, emit, tryTable } from '../../tecs';
import { Position, Velocity } from '../ecs';
import { Game } from '../game';
import { compareColliders } from './checks';
import { ColliderSet, ActiveCollisions } from './components';
import { willCollideTopic } from './topics';

// 1. Get all entities that have CollisionSource + ColliderSet + Position (+ Awaken)
// 1. Calculate the next position based on the current position + velocity
// 1. Check if the next position collides with any other ColliderSet
// 1. If collides create event

export const checkCollisionsQuery = newQuery(ActiveCollisions, ColliderSet, Position);
export const collidersQuery = newQuery(ColliderSet, Position);

export const checkNarrowCollisionSimple = (game: Game): System => {
  const forCheckQ = registerQuery(game.essence, checkCollisionsQuery);
  const allCollidersQ = registerQuery(game.essence, collidersQuery);

  return ({ deltaTime }) => {
    const forCheckColliders: {
      entity: Entity;
      colliderSet: SchemaType<typeof ColliderSet>;
      position: SchemaType<typeof Position>;
      velocity: SchemaType<typeof Velocity>;
    }[] = [];

    for (let i = 0; i < forCheckQ.archetypes.length; i++) {
      const archetype = forCheckQ.archetypes[i];

      const colliderSetT = table(archetype, ColliderSet);
      const positionT = table(archetype, Position);
      const velocityT = tryTable(archetype, Velocity);

      for (let i = 0; i < archetype.entities.length; i++) {
        const entity = archetype.entities[i];

        const colliderSet = colliderSetT[i];
        const position = positionT[i];
        const velocity = velocityT
          ? velocityT[i]
          : {
              x: 0,
              y: 0,
            };

        forCheckColliders.push({
          entity,
          colliderSet,
          position,
          velocity,
        });
      }
    }

    if (forCheckColliders.length === 0) {
      return;
    }

    for (let i = 0; i < allCollidersQ.archetypes.length; i++) {
      const archetype = allCollidersQ.archetypes[i];

      const colliderSetTB = table(archetype, ColliderSet);
      const positionTB = table(archetype, Position);
      const velocityTB = tryTable(archetype, Velocity);

      for (let a = 0; a < forCheckColliders.length; a++) {
        const entityA = forCheckColliders[a].entity;
        const colliderSetA = forCheckColliders[a].colliderSet;
        const positionA = forCheckColliders[a].position;
        const velocityA = forCheckColliders[a].velocity;

        const colliderSetNewPositionA = {
          x: positionA.x + velocityA.x * deltaTime,
          y: positionA.y + velocityA.y * deltaTime,
        };

        for (let i = 0; i < archetype.entities.length; i++) {
          const entityB = archetype.entities[i];

          if (entityA === entityB) {
            continue;
          }

          const colliderSetB = colliderSetTB[i];
          const positionB = positionTB[i];
          const velocityB = velocityTB
            ? velocityTB[i]
            : {
                x: 0,
                y: 0,
              };

          const colliderSetNewPositionB = {
            x: positionB.x + velocityB.x * deltaTime,
            y: positionB.y + velocityB.y * deltaTime,
          };

          for (const colliderA of colliderSetA.list) {
            const colliderNewPositionA = {
              x: colliderA.position.x + colliderSetNewPositionA.x,
              y: colliderA.position.y + colliderSetNewPositionA.y,
            };

            for (const colliderB of colliderSetB.list) {
              const colliderNewPositionB = {
                x: colliderB.position.x + colliderSetNewPositionB.x,
                y: colliderB.position.y + colliderSetNewPositionB.y,
              };

              const overlap = compareColliders(
                {
                  ...colliderA,
                  position: colliderNewPositionA,
                },
                {
                  ...colliderB,
                  position: colliderNewPositionB,
                }
              );

              if (overlap >= 0) {
                emit(
                  willCollideTopic,
                  {
                    name: 'willCollide',
                    a: {
                      entity: entityA,
                      colliderSet: colliderSetA,
                      collider: colliderA,
                      collidingPosition: colliderSetNewPositionA,
                      overlap,
                    },
                    b: {
                      entity: entityB,
                      colliderSet: colliderSetB,
                      collider: colliderB,
                      collidingPosition: colliderSetNewPositionB,
                      overlap,
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

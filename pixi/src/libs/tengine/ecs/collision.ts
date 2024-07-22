import { emit, Entity, newQuery, newTopic, registerQuery, SchemaType, System, table } from '../../tecs';
import { Game } from '../game';
import { CollisionBody, Position, Size } from './components';

export const areCirclesColliding = (
  positionA: SchemaType<typeof Position>,
  sizeA: SchemaType<typeof Size>,
  positionB: SchemaType<typeof Position>,
  sizeB: SchemaType<typeof Size>
) => {
  const dx = positionA.x - positionB.x;
  const dy = positionA.y - positionB.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = sizeA.width / 2 + sizeB.width / 2;

  return distance < minDistance;
};

export type CollidingEvent = {
  a: Entity;
  b: Entity;
};

export const collidingTopic = newTopic<CollidingEvent>();

export const collisionQuery = newQuery(CollisionBody, Position);

export const runNarrowPhaseSimple = (game: Game): System => {
  const query = registerQuery(game.essence, collisionQuery);

  return () => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];
      const positionT = table(archetype, Position);
      const collisionBodyT = table(archetype, CollisionBody);

      for (let a = 0; a < archetype.entities.length; a++) {
        const entityA = archetype.entities[a];
        const positionA = positionT[a];
        const collisionBodyA = collisionBodyT[a];
        const collisionBodyPositionA = collisionBodyA.position;

        for (let b = a + 1; b < archetype.entities.length; b++) {
          const entityB = archetype.entities[b];
          const positionB = positionT[b];
          const collisionBodyB = collisionBodyT[b];
          const collisionBodyPositionB = collisionBodyB.position;

          for (const partA of collisionBodyA.parts) {
            const partPositionA = {
              x: positionA.x + collisionBodyPositionA.x + partA.position.x,
              y: positionA.y + collisionBodyPositionA.x + partA.position.y,
            };

            for (const partB of collisionBodyB.parts) {
              const partPositionB = {
                x: positionB.x + collisionBodyPositionB.x + partB.position.x,
                y: positionB.y + collisionBodyPositionB.x + partB.position.y,
              };

              if (partA.shape.name === 'circle' && partB.shape.name === 'circle') {
                const isColliding = areCirclesColliding(partPositionA, partA.size, partPositionB, partB.size);
                // debugger;

                if (isColliding) {
                  emit(collidingTopic, {
                    a: entityA,
                    b: entityB,
                  });
                }
              }
            }
          }
        }
      }
    }
  };
};

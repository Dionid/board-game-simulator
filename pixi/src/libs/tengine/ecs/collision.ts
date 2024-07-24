import {
  arrayOf,
  emit,
  Entity,
  newQuery,
  newSchema,
  newTopic,
  registerQuery,
  SchemaType,
  System,
  table,
  Tag,
} from '../../tecs';
import { Game } from '../game';
import { Position, Shape, Size } from './components';

// QUESTION: must be part of CollisionBodyPart, but how to do it?
export const ColliderSolid = Tag.new();
export const ColliderSensor = Tag.new();

export const CollisionBodyPart = newSchema({
  shape: Shape,
  size: Size,
  position: Position, // this is relative to the entity CollisionBody
});

export const CollisionBody = newSchema({
  parts: arrayOf(CollisionBodyPart), // QUESTION: must be array of entities???
  position: Position, // this is relative to the entity Position
});

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

export const areCircleAndRectangleColliding = (
  circlePosition: SchemaType<typeof Position>,
  circleSize: SchemaType<typeof Size>,
  rectanglePosition: SchemaType<typeof Position>,
  rectangleSize: SchemaType<typeof Size>
) => {
  const dx = Math.max(
    rectanglePosition.x - circlePosition.x,
    0,
    circlePosition.x - rectanglePosition.x - rectangleSize.width
  );
  const dy = Math.max(
    rectanglePosition.y - circlePosition.y,
    0,
    circlePosition.y - rectanglePosition.y - rectangleSize.height
  );
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = circleSize.width / 2;

  return distance < minDistance;
};

// # Check if two rectangles are colliding using AABB algorithm
export const areRectanglesColliding = (
  positionA: SchemaType<typeof Position>,
  sizeA: SchemaType<typeof Size>,
  positionB: SchemaType<typeof Position>,
  sizeB: SchemaType<typeof Size>
) => {
  return (
    positionA.x < positionB.x + sizeB.width &&
    positionA.x + sizeA.width > positionB.x &&
    positionA.y < positionB.y + sizeB.height &&
    positionA.y + sizeA.height > positionB.y
  );
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
    const entitiesWIthColliders: {
      entity: Entity;
      collisionBodyPosition: SchemaType<typeof Position>;
      collisionBody: SchemaType<typeof CollisionBody>;
    }[] = [];

    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];

      const positionT = table(archetype, Position);
      const collisionBodyT = table(archetype, CollisionBody);

      for (let a = 0; a < archetype.entities.length; a++) {
        const entity = archetype.entities[a];

        const position = positionT[a];
        const collisionBody = collisionBodyT[a];
        const collisionBodyPosition = {
          x: position.x + collisionBody.position.x,
          y: position.y + collisionBody.position.y,
        };

        entitiesWIthColliders.push({
          entity,
          collisionBody,
          collisionBodyPosition,
        });
      }
    }

    // debugger;
    for (let a = 0; a < entitiesWIthColliders.length; a++) {
      const entityA = entitiesWIthColliders[a].entity;
      const collisionBodyPositionA = entitiesWIthColliders[a].collisionBodyPosition;
      const collisionBodyA = entitiesWIthColliders[a].collisionBody;

      for (let b = a + 1; b < entitiesWIthColliders.length; b++) {
        const entityB = entitiesWIthColliders[b].entity;
        const collisionBodyB = entitiesWIthColliders[b].collisionBody;
        const collisionBodyPositionB = entitiesWIthColliders[b].collisionBodyPosition;

        for (const partA of collisionBodyA.parts) {
          const partPositionA = {
            x: collisionBodyPositionA.x + partA.position.x,
            y: collisionBodyPositionA.y + partA.position.y,
          };

          for (const partB of collisionBodyB.parts) {
            const partPositionB = {
              x: collisionBodyPositionB.x + partB.position.x,
              y: collisionBodyPositionB.y + partB.position.y,
            };

            if (partA.shape.name === 'circle' && partB.shape.name === 'circle') {
              const areColliding = areCirclesColliding(partPositionA, partA.size, partPositionB, partB.size);

              if (areColliding) {
                // console.log('areCirclesColliding', partPositionA, partA.size, partPositionB, partB.size, areColliding);
                // debugger;
                emit(
                  collidingTopic,
                  {
                    a: entityA,
                    b: entityB,
                  },
                  true
                );
              }

              continue;
            }

            if (
              (partA.shape.name === 'circle' && partB.shape.name === 'rectangle') ||
              (partA.shape.name === 'rectangle' && partB.shape.name === 'circle')
            ) {
              const areColliding = areCircleAndRectangleColliding(
                partA.shape.name === 'circle' ? partPositionA : partPositionB,
                partA.shape.name === 'circle' ? partA.size : partB.size,
                partA.shape.name === 'rectangle' ? partPositionA : partPositionB,
                partA.shape.name === 'rectangle' ? partA.size : partB.size
              );

              if (areColliding) {
                emit(
                  collidingTopic,
                  {
                    a: entityA,
                    b: entityB,
                  },
                  true
                );
              }

              continue;
            }

            if (partA.shape.name === 'rectangle' && partB.shape.name === 'rectangle') {
              const areColliding = areRectanglesColliding(partPositionA, partA.size, partPositionB, partB.size);

              if (areColliding) {
                emit(
                  collidingTopic,
                  {
                    a: entityA,
                    b: entityB,
                  },
                  true
                );
              }

              continue;
            }
          }
        }
      }
    }
  };
};

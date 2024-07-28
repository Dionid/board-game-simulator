import {
  componentByEntity,
  newQuery,
  registerQuery,
  registerTopic,
  SchemaToType,
  System,
  table,
} from 'libs/tecs';
import { Game } from '../game';
import { mulScalarV2, mutAddV2, mutSubV2, normalizeV2, Position2 } from '../core';
import { colliding } from './topics';
import { ColliderCircle, ColliderSet, Immovable, Impenetrable } from './components';
import { safeGuard } from 'libs/tecs/switch';

export const penetrationResolution = (game: Game): System => {
  const topic = registerTopic(game.essence, colliding);

  return () => {
    for (const event of topic) {
      const { a, b, depth } = event;

      // # We only resolve penetration between solid objects
      if (a.collider.type !== 'solid' && b.collider.type !== 'solid') {
        continue;
      }

      const aImpenetrable = componentByEntity(game.essence, a.entity, Impenetrable);
      const bImpenetrable = componentByEntity(game.essence, b.entity, Impenetrable);

      // # We don't resolve penetration if both objects are not impenetrable
      if (!aImpenetrable && !bImpenetrable) {
        continue;
      }

      const aImmovable = componentByEntity(game.essence, a.entity, Immovable);
      const bImmovable = componentByEntity(game.essence, b.entity, Immovable);

      const aPosition = componentByEntity(game.essence, a.entity, Position2);
      const bPosition = componentByEntity(game.essence, b.entity, Position2);

      if (!aPosition || !bPosition) {
        continue;
      }

      // switch(a.collider.shape.type) {
      //   case "circle":
      //   case "constant_rectangle":
      //     break;
      //   default:
      //     safeGuard(a.collider.shape);
      // }

      const aCollider = a.collider;
      const bCollider = b.collider;

      const aColliderShape = aCollider.shape;
      const bColliderShape = b.collider.shape;

      // # Circle Collision Resolution
      if (aColliderShape.type === 'circle' && bColliderShape.type === 'circle') {
        const normDist = normalizeV2({
          x: aPosition.x - bPosition.x,
          y: aPosition.y - bPosition.y,
        });

        if (aImmovable) {
          const resolution = mulScalarV2(normDist, depth);

          mutAddV2(bPosition, resolution);
        } else if (bImmovable) {
          const resolution = mulScalarV2(normDist, depth);

          mutAddV2(aPosition, resolution);
        } else {
          const resolution = mulScalarV2(normDist, depth / 2);

          mutAddV2(aPosition, resolution);
          mutSubV2(bPosition, resolution);
        }

        continue;
      }

      if (
        (aColliderShape.type === 'circle' && bColliderShape.type === 'constant_rectangle') ||
        (aColliderShape.type === 'constant_rectangle' && bColliderShape.type === 'circle')
      ) {
        const circleCollider =
          aColliderShape.type === 'circle'
            ? aCollider
            : bColliderShape.type === 'circle'
            ? bCollider
            : null;
        const rectCollider =
          aColliderShape.type === 'constant_rectangle'
            ? aCollider
            : bColliderShape.type === 'constant_rectangle'
            ? bCollider
            : null;

        if (!circleCollider || !rectCollider) {
          throw new Error('Invalid collider');
        }

        const circleShape =
          aColliderShape.type === 'circle'
            ? aColliderShape
            : bColliderShape.type === 'circle'
            ? bColliderShape
            : null;
        const rectShape =
          aColliderShape.type === 'constant_rectangle'
            ? aColliderShape
            : bColliderShape.type === 'constant_rectangle'
            ? bColliderShape
            : null;

        if (!circleShape || !rectShape) {
          throw new Error('Invalid collider shape');
        }

        const circlePosition = aColliderShape.type === 'circle' ? aPosition : bPosition;
        const rectPosition = bColliderShape.type === 'constant_rectangle' ? bPosition : aPosition;

        const circleImmovable =
          aColliderShape.type === 'circle'
            ? aImmovable
            : bColliderShape.type === 'circle'
            ? bImmovable
            : null;

        const rectImmovable =
          aColliderShape.type === 'constant_rectangle'
            ? aImmovable
            : bColliderShape.type === 'constant_rectangle'
            ? bImmovable
            : null;

        if (!circleImmovable && !rectImmovable) {
          continue;
        }

        const comingFromTop = circlePosition.y < rectPosition.y;
        const comingFromBottom = circlePosition.y > rectPosition.y + rectShape.height;

        const comingFromLeft = circlePosition.x < rectPosition.x;
        const comingFromRight = circlePosition.x > rectPosition.x + rectShape.width;

        const resolution = mulScalarV2(
          {
            x: comingFromLeft ? -1 : comingFromRight ? 1 : 0,
            y: comingFromTop ? -1 : comingFromBottom ? 1 : 0,
          },
          depth
        );

        mutAddV2(circlePosition, resolution);

        continue;
      }
    }
  };
};

const characterPositionColliderQ = newQuery(Position2, ColliderSet);

export const applyWorldBoundaries = (game: Game): System => {
  const query = registerQuery(game.essence, characterPositionColliderQ);

  return ({ deltaTime }) => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];
      const positionT = table(archetype, Position2);
      const colliderSetT = table(archetype, ColliderSet);

      for (let j = 0; j < archetype.entities.length; j++) {
        const position = positionT[j];
        const colliderSet = colliderSetT[j];

        for (const part of colliderSet.list) {
          const pivot = part.offset;
          switch (part.type) {
            case 'solid': {
              switch (part.shape.type) {
                case 'circle':
                  if (position.x - pivot.x - part.shape.radius < 0) {
                    position.x = pivot.x + part.shape.radius;
                  }
                  if (position.y - pivot.y - part.shape.radius < 0) {
                    position.y = pivot.y + part.shape.radius;
                  }
                  if (position.x + part.shape.radius - pivot.x > game.world.size.width) {
                    position.x = game.world.size.width - part.shape.radius + pivot.x;
                  }
                  if (position.y + part.shape.radius - pivot.y > game.world.size.height) {
                    position.y = game.world.size.height - part.shape.radius + pivot.y;
                  }
                  break;
                case 'constant_rectangle':
                  if (position.x - pivot.x < 0) {
                    position.x = pivot.x;
                  }
                  if (position.y - pivot.y < 0) {
                    position.y = pivot.y;
                  }
                  if (position.x + part.shape.width - pivot.x > game.world.size.width) {
                    position.x = game.world.size.width - part.shape.width + pivot.x;
                  }
                  if (position.y + part.shape.height - pivot.y > game.world.size.height) {
                    position.y = game.world.size.height - part.shape.height + pivot.y;
                  }
                  break;
                default:
                  safeGuard(part.shape);
              }
              break;
            }
            case 'sensor':
              break;
            default:
              safeGuard(part.type);
          }
        }
      }
    }
  };
};

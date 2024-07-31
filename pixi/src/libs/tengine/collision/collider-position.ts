import { newQuery, System, registerQuery, table } from 'libs/tecs';
import { Position2 } from '../core';
import { Game } from '../game';
import { ColliderSet } from './components';
import { safeGuard } from 'libs/tecs/switch';

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
          let nX = position.x + collider.offset.x;
          let nY = position.y + collider.offset.y;

          switch (collider.shape.type) {
            case 'circle': {
              const anchor = collider.shape.anchor;
              nX = nX + collider.shape.radius - collider.shape.radius * 2 * anchor.x;
              nY = nY + collider.shape.radius - collider.shape.radius * 2 * anchor.y;
              break;
            }
            case 'rectangle': {
              const anchor = collider.shape.anchor;
              nX = nX - collider.shape.width * anchor.x;
              nY = nY - collider.shape.height * anchor.y;
              break;
            }
            case 'line': {
              const anchor = collider.shape.anchor;
              nY = nY - collider.shape.length * anchor;
              break;
            }
            default:
              safeGuard(collider.shape);
          }

          collider._position.x = nX;
          collider._position.y = nY;
        }
      }
    }
  };
};

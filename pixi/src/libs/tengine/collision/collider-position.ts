import { newQuery, System, registerQuery, table } from 'libs/tecs';
import { mutTranslateVertices2, Position2 } from '../core';
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

        const delta = {
          x: position.x - position._prev.x,
          y: position.y - position._prev.y,
        };

        for (const collider of colliderSet.list) {
          collider._position.x += delta.x;
          collider._position.y += delta.y;

          mutTranslateVertices2(collider._vertices, delta.x, delta.y);
        }
      }
    }
  };
};

import { newQuery, System, registerQuery, table } from 'libs/tecs';
import { mutRotateVertices2Around, mutTranslateVertices2, Position2, subV2 } from '../core';
import { Game } from '../game';
import { ColliderSet } from './components';

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

        const positionDelta = {
          x: position.x - position._prev.x,
          y: position.y - position._prev.y,
        };

        for (const collider of colliderSet.list) {
          const angleDelta = collider.angle - collider._prev.angle;
          collider._prev.angle = collider.angle;

          const offsetDelta = subV2(collider.offset, collider._prev.offset);
          collider._prev.offset.x = collider.offset.x;
          collider._prev.offset.y = collider.offset.y;

          positionDelta.x += offsetDelta.x;
          positionDelta.y += offsetDelta.y;

          collider._position.x += positionDelta.x;
          collider._position.y += positionDelta.y;

          collider._origin.x += positionDelta.x;
          collider._origin.y += positionDelta.y;

          mutTranslateVertices2(collider._vertices, positionDelta.x, positionDelta.y);
          mutRotateVertices2Around(collider._vertices, angleDelta, collider._origin);
        }
      }
    }
  };
};

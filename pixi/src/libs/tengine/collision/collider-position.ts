import { newQuery, System, registerQuery, table } from 'libs/tecs';
import { Position2 } from '../core';
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

        for (const collider of colliderSet.list) {
          collider.position.x = position.x + collider.offset.x;
          collider.position.y = position.y + collider.offset.y;
        }
      }
    }
  };
};

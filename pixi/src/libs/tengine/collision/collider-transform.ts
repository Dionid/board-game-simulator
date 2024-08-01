import { newQuery, System, registerQuery, table, tryTable, Component } from 'libs/tecs';
import {
  Angle,
  mutRotateAxes2,
  mutRotateVertices2Around,
  mutTranslateVertices2,
  Position2,
  subV2,
} from '../core';
import { Game } from '../game';
import { Collider, ColliderSet } from './components';

export function translateCollider(collider: Component<typeof Collider>, positionDelta: Position2) {
  collider._position.x += positionDelta.x;
  collider._position.y += positionDelta.y;

  collider._origin.x += positionDelta.x;
  collider._origin.y += positionDelta.y;

  if (positionDelta.x !== 0 || positionDelta.y !== 0) {
    mutTranslateVertices2(collider._vertices, positionDelta.x, positionDelta.y);
  }
}

export const positionColliderSetQuery = newQuery(ColliderSet, Position2);

export const transformCollider = (game: Game): System => {
  const query = registerQuery(game.essence, positionColliderSetQuery);

  return () => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];

      const colliderSetT = table(archetype, ColliderSet);
      const positionT = table(archetype, Position2);

      const angleT = tryTable(archetype, Angle);

      for (let j = 0; j < archetype.entities.length; j++) {
        const colliderSet = colliderSetT[j];
        const position = positionT[j];

        const parentAngleDelta = angleT ? angleT[j].value - angleT[j]._prev : 0;

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

          translateCollider(collider, positionDelta);

          if (angleDelta !== 0) {
            mutRotateVertices2Around(collider._vertices, angleDelta, collider._origin);
            mutRotateAxes2(collider._normalAxes, angleDelta);
          }
          if (parentAngleDelta !== 0) {
            mutRotateVertices2Around(collider._vertices, parentAngleDelta, position);
            mutRotateAxes2(collider._normalAxes, parentAngleDelta);
          }
        }
      }
    }
  };
};

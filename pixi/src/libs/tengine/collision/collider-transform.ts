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
import { Collider, ColliderBody } from './components';

export function translateCollider(collider: Component<typeof Collider>, positionDelta: Position2) {
  collider._position.x += positionDelta.x;
  collider._position.y += positionDelta.y;

  if (positionDelta.x !== 0 || positionDelta.y !== 0) {
    mutTranslateVertices2(collider._vertices, positionDelta.x, positionDelta.y);
  }
}

export const positionColliderSetQuery = newQuery(ColliderBody, Position2);

export const transformCollider = (game: Game): System => {
  const query = registerQuery(game.essence, positionColliderSetQuery);

  return () => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];

      const colliderSetT = table(archetype, ColliderBody);
      const positionT = table(archetype, Position2);

      const angleT = tryTable(archetype, Angle);

      for (let j = 0; j < archetype.entities.length; j++) {
        const entity = archetype.entities[j];
        const colliderSet = colliderSetT[j];
        const position = positionT[j];

        const parentAngleDelta = angleT ? angleT[j].value - angleT[j]._prev : 0;

        const positionDelta = {
          x: position.x - position._prev.x,
          y: position.y - position._prev.y,
        };

        for (const collider of colliderSet.parts) {
          const angleDelta = collider.angle - collider._prev.angle;
          collider._prev.angle = collider.angle;

          const offsetDelta = subV2(collider.offset, collider._prev.offset);
          collider._prev.offset.x = collider.offset.x;
          collider._prev.offset.y = collider.offset.y;

          // # Apply offset change
          positionDelta.x += offsetDelta.x;
          positionDelta.y += offsetDelta.y;

          // # Change collider position accordingly to positionDelta
          translateCollider(collider, positionDelta);

          if (angleDelta !== 0) {
            mutRotateVertices2Around(collider._vertices, angleDelta, collider._position);
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

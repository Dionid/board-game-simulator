import {
  componentByEntity,
  newQuery,
  registerQuery,
  registerTopic,
  System,
  table,
} from 'libs/tecs';
import { Game } from '../game';
import { multV2, mutAddV2, mutSubV2, mutTranslateVertices2, Position2 } from '../core';
import { unfilteredColliding } from './topics';
import { ColliderSet, Impenetrable } from './components';
import { inverseMass } from './math';

export const penetrationResolution = (game: Game): System => {
  const topic = registerTopic(game.essence, unfilteredColliding);

  return () => {
    for (const event of topic) {
      const { a, b, overlap, axis } = event;

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

      const aPosition = componentByEntity(game.essence, a.entity, Position2);
      const bPosition = componentByEntity(game.essence, b.entity, Position2);

      if (!aPosition || !bPosition) {
        continue;
      }

      const aColliderSet = componentByEntity(game.essence, a.entity, ColliderSet);
      const bColliderSet = componentByEntity(game.essence, b.entity, ColliderSet);

      if (!aColliderSet || !bColliderSet) {
        continue;
      }

      const aInvertedMass = inverseMass(a.collider.mass);
      const bInvertedMass = inverseMass(a.collider.mass);
      const combinedInvertedMass = aInvertedMass + bInvertedMass;

      const resolution = multV2(axis, overlap / combinedInvertedMass);

      const aPrevPosition = {
        x: aPosition.x,
        y: aPosition.y,
      };
      const bPrevPosition = {
        x: bPosition.x,
        y: bPosition.y,
      };

      mutAddV2(aPosition, multV2(resolution, aInvertedMass));
      mutSubV2(bPosition, multV2(resolution, bInvertedMass));

      const aPositionDelta = {
        x: aPosition.x - aPrevPosition.x,
        y: aPosition.y - aPrevPosition.y,
      };

      const bPositionDelta = {
        x: bPosition.x - bPrevPosition.x,
        y: bPosition.y - bPrevPosition.y,
      };

      a.collider._position.x += aPositionDelta.x;
      a.collider._position.y += aPositionDelta.y;
      a.collider._origin.x += aPositionDelta.x;
      a.collider._origin.y += aPositionDelta.y;

      b.collider._position.x += bPositionDelta.x;
      b.collider._position.y += bPositionDelta.y;
      b.collider._origin.x += bPositionDelta.x;
      b.collider._origin.y += bPositionDelta.y;

      if (aPositionDelta.x !== 0 || aPositionDelta.y !== 0) {
        mutTranslateVertices2(a.collider._vertices, aPositionDelta.x, aPositionDelta.y);
      }

      if (bPositionDelta.x !== 0 || bPositionDelta.y !== 0) {
        mutTranslateVertices2(b.collider._vertices, bPositionDelta.x, bPositionDelta.y);
      }

      return;
    }
  };
};

// # World boundaries

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

        for (const collider of colliderSet.list) {
          // Add SAT
          // ...
        }
      }
    }
  };
};

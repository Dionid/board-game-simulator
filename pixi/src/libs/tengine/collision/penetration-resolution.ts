import { componentByEntity, registerTopic, System } from 'libs/tecs';
import { Game } from '../game';
import { mulV2, mutAddV2, mutSubV2, Position2, unitV2 } from '../core';
import { colliding } from './topics';
import { Immovable, Impenetrable } from './components';

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

      // # Circle Collision Resolution
      if (a.collider.shape.type === 'circle' && b.collider.shape.type === 'circle') {
        const distance = {
          x: aPosition.x - bPosition.x,
          y: aPosition.y - bPosition.y,
        };

        if (aImmovable) {
          const resolution = mulV2(unitV2(distance), depth);

          mutAddV2(bPosition, resolution);
        } else if (bImmovable) {
          const resolution = mulV2(unitV2(distance), depth);

          mutAddV2(aPosition, resolution);
        } else {
          const resolution = mulV2(unitV2(distance), depth / 2);

          mutAddV2(aPosition, resolution);
          mutSubV2(bPosition, resolution);
        }

        continue;
      }
    }
  };
};

import { componentByEntity, registerTopic, System } from 'libs/tecs';
import { Game } from '../game';
import { mulV2, mutAddV2, mutSubV2, Position2, unitV2 } from '../core';
import { colliding } from './topics';
import { CantBeAffectedByPenetrationResolution, ForbidSolidPenetration } from './components';

export const penetrationResolution = (game: Game): System => {
  const topic = registerTopic(game.essence, colliding);

  return () => {
    for (const event of topic) {
      const { a, b, depth } = event;

      // # We only resolve penetration between solid objects
      if (a.collider.type !== 'solid' && b.collider.type !== 'solid') {
        continue;
      }

      const aCantBeAffectedByPenetrationResolution = componentByEntity(
        game.essence,
        a.entity,
        CantBeAffectedByPenetrationResolution
      );
      const bCantBeAffectedByPenetrationResolution = componentByEntity(
        game.essence,
        b.entity,
        CantBeAffectedByPenetrationResolution
      );

      if (aCantBeAffectedByPenetrationResolution && bCantBeAffectedByPenetrationResolution) {
        continue;
      }

      const aForbidSolidPenetration = componentByEntity(
        game.essence,
        a.entity,
        ForbidSolidPenetration
      );
      const bForbidSolidPenetration = componentByEntity(
        game.essence,
        b.entity,
        ForbidSolidPenetration
      );

      // # We don't resolve penetration if both objects are not forbidden to penetration
      if (!aForbidSolidPenetration && !bForbidSolidPenetration) {
        continue;
      }

      const aPosition = componentByEntity(game.essence, a.entity, Position2);
      const bPosition = componentByEntity(game.essence, b.entity, Position2);

      if (!aPosition || !bPosition) {
        continue;
      }

      // # Circle Collision Resolution
      const distance = {
        x: aPosition.x - bPosition.x,
        y: aPosition.y - bPosition.y,
      };

      if (aCantBeAffectedByPenetrationResolution) {
        const resolution = mulV2(unitV2(distance), depth);

        mutAddV2(bPosition, resolution);
      } else if (bCantBeAffectedByPenetrationResolution) {
        const resolution = mulV2(unitV2(distance), depth);

        mutAddV2(aPosition, resolution);
      } else {
        const resolution = mulV2(unitV2(distance), depth / 2);

        mutAddV2(aPosition, resolution);
        mutSubV2(bPosition, resolution);
      }
    }
  };
};

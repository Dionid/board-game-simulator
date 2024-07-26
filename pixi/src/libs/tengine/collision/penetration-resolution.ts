import { componentByEntity, registerTopic, System } from 'libs/tecs';
import { Game } from '../game';
import { mulV2, mutAddV2, mutSubV2, Position2, unitV2 } from '../core';
import { colliding } from './topics';

export const penetrationResolution = (game: Game): System => {
  const topic = registerTopic(game.essence, colliding);

  return () => {
    for (const event of topic) {
      const { a, b, depth } = event;

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

      const resolution = mulV2(unitV2(distance), depth / 2);

      mutAddV2(aPosition, resolution);
      mutSubV2(bPosition, resolution);
    }
  };
};

import { Game } from '../game';
import { newQuery, registerQuery, System, table } from '../../tecs';
import { Position, Size, body, mBody } from '../ecs/components';
import Matter from 'matter-js';

const physicsBodyPositionQuery = newQuery(Position, Size, mBody);

export const matterSyncPhysicsBodyPosition = (game: Game): System => {
  const query = registerQuery(game.essence, physicsBodyPositionQuery);

  return () => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];
      const positionT = table(archetype, Position);
      const mBodyT = table(archetype, mBody);
      const sizeT = table(archetype, Size);

      for (let j = 0; j < archetype.entities.length; j++) {
        const position = positionT[j];
        const mBody = mBodyT[j];
        const size = sizeT[j];

        let newX: number;
        let newY: number;

        if (mBody.value.circleRadius) {
          newX = position.x;
          newY = position.y;
        } else {
          newX = position.x + size.width / 2;
          newY = position.y + size.height / 2;
        }

        if (mBody.value.isStatic) {
          Matter.Body.setPosition(mBody.value, { x: newX, y: newY });
        } else {
          mBody.value.position.x = newX;
          mBody.value.position.y = newY;
        }

        // object don't interact
        // Body.setPosition(mBody.value, { x: position.x, y: position.y });
      }
    }
  };
};

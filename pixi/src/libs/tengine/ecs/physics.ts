import { Game } from '../game';
import { newQuery, registerQuery, System, table } from '../../tecs';
import { Position, Size, mBody } from './components';

const physicsBodyPositionQuery = newQuery(Position, Size, mBody);

export const syncPhysicsBodyPosition = (game: Game): System => {
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

        mBody.value.position.x = position.x;
        mBody.value.position.y = position.y;
        // mBody.value.position.x = position.x;
        // mBody.value.position.y = position.y;
      }
    }
  };
};

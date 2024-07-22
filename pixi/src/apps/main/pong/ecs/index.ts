import {
  archetypeByEntity,
  Entity,
  newQuery,
  newTag,
  registerQuery,
  System,
  table,
  tryTable,
} from '../../../../libs/tecs';
import { Position, Size, Speed, Velocity } from '../../../../libs/tengine/ecs';
import { Game } from '../../../../libs/tengine/game';

export const GameObject = newTag();

export const Player = newTag();
export const Enemy = newTag();
export const Ball = newTag();

export type Directions = 'up' | 'down' | 'left' | 'right';

export const moveByArrows = (game: Game, playerEntity: Entity): System => {
  const input = game.input;
  const keyboard = input.keyboard;

  const getYDirection = (): number => {
    if (keyboard.keyDown['ArrowUp'] || keyboard.keyDown['w']) {
      return 1;
    }

    if (keyboard.keyDown['ArrowDown'] || keyboard.keyDown['s']) {
      return -1;
    }

    return 0;
  };

  return ({ deltaTime }) => {
    const playerArchetype = archetypeByEntity(game.essence, playerEntity);

    if (!playerArchetype) {
      return;
    }

    const velocityT = tryTable(playerArchetype, Velocity);

    if (!velocityT) {
      return;
    }

    const velocity = velocityT[0];

    if (!velocity) {
      return;
    }

    const directionY = getYDirection();

    velocity.y = -1 * directionY * deltaTime;
  };
};

export const velocityPositionQuery = newQuery(Velocity, Position, Speed);

export const addVelocityToPosition = (game: Game): System => {
  const query = registerQuery(game.essence, velocityPositionQuery);

  return ({ deltaTime }) => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];
      const velocityT = table(archetype, Velocity);
      const positionT = table(archetype, Position);
      const speedT = table(archetype, Speed);

      for (let j = 0; j < archetype.entities.length; j++) {
        const velocity = velocityT[j];
        const position = positionT[j];
        const speed = speedT[j];

        position.x += velocity.x * deltaTime * speed.value;
        position.y += velocity.y * deltaTime * speed.value;
      }
    }
  };
};

const characterVelocityQ = newQuery(GameObject, Position, Size);

export const applyCharactersWorldBoundaries = (game: Game): System => {
  const query = registerQuery(game.essence, characterVelocityQ);

  return ({ deltaTime }) => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];
      // const velocityT = table(archetype, Velocity);
      const positionT = table(archetype, Position);
      const sizeT = table(archetype, Size);

      for (let j = 0; j < archetype.entities.length; j++) {
        const position = positionT[j];
        const size = sizeT[j];

        if (position.x < 0) {
          position.x = 0;
        }

        if (position.y < 0) {
          position.y = 0;
        }

        if (position.x + size.width > game.world.size.width) {
          position.x = game.world.size.width;
        }

        if (position.y + size.height > game.world.size.height) {
          position.y = game.world.size.height - size.height;
        }
      }
    }
  };
};

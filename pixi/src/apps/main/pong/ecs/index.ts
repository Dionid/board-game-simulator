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
import { Acceleration, Pivot, Position, Size, Speed, Velocity } from '../../../../libs/tengine/ecs';
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

    const accelerationT = tryTable(playerArchetype, Acceleration);

    if (!accelerationT) {
      return;
    }

    const acceleration = accelerationT[0];

    if (!acceleration) {
      return;
    }

    const directionY = getYDirection();

    acceleration.y = -1 * directionY * deltaTime;
  };
};

export const velocityPositionQuery = newQuery(Velocity, Position, Speed, Acceleration);

export const addVelocityToPosition = (game: Game): System => {
  const query = registerQuery(game.essence, velocityPositionQuery);

  return ({ deltaTime }) => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];
      const velocityT = table(archetype, Velocity);
      const positionT = table(archetype, Position);
      const speedT = table(archetype, Speed);
      const accelerationT = table(archetype, Acceleration);

      for (let j = 0; j < archetype.entities.length; j++) {
        const velocity = velocityT[j];
        const position = positionT[j];
        const speed = speedT[j];
        const acceleration = accelerationT[j];

        // # Apply acceleration to velocity
        velocity.x += acceleration.x * deltaTime * speed.value;
        velocity.y += acceleration.y * deltaTime * speed.value;

        // # Apply velocity to position
        position.x += velocity.x * deltaTime;
        position.y += velocity.y * deltaTime;

        // # Apply friction to velocity
        velocity.x *= 0.85 * deltaTime;
        velocity.y *= 0.85 * deltaTime;
      }
    }
  };
};

const characterVelocityQ = newQuery(GameObject, Position, Size, Pivot);

export const applyGOWorldBoundaries = (game: Game): System => {
  const query = registerQuery(game.essence, characterVelocityQ);

  return ({ deltaTime }) => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];
      // const velocityT = table(archetype, Velocity);
      const positionT = table(archetype, Position);
      const sizeT = table(archetype, Size);
      const pivotT = table(archetype, Pivot);

      for (let j = 0; j < archetype.entities.length; j++) {
        const position = positionT[j];
        const size = sizeT[j];
        const pivot = pivotT[j];

        if (position.x < 0) {
          position.x = 0;
        }

        if (position.y < 0) {
          position.y = 0;
        }

        if (position.x + size.width - pivot.x > game.world.size.width) {
          position.x = game.world.size.width - size.width + pivot.x;
        }

        if (position.y + size.height - pivot.y > game.world.size.height) {
          position.y = game.world.size.height - size.height + pivot.y;
        }
      }
    }
  };
};

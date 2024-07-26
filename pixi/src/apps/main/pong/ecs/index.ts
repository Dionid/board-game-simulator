import {
  archetypeByEntity,
  Entity,
  newQuery,
  newTag,
  registerQuery,
  System,
  table,
  tryTable,
} from 'libs/tecs';
import { KeyBoardInput } from 'libs/tengine/core';
import { Pivot2, Position2 } from 'libs/tengine/physics/components';
import { Game } from 'libs/tengine/game';
import { Acceleration2, Speed, Velocity2 } from 'libs/tengine/physics';

// export const GameObject = newTag();

export const Player = newTag();
export const Enemy = newTag();
export const Ball = newTag();

export type Directions = 'up' | 'down' | 'left' | 'right';

const getXDirection = (keyboard: KeyBoardInput): number => {
  if (keyboard.keyDown['ArrowRight'] || keyboard.keyDown['d']) {
    return -1;
  }

  if (keyboard.keyDown['ArrowLeft'] || keyboard.keyDown['a']) {
    return 1;
  }

  return 0;
};

const getYDirection = (keyboard: KeyBoardInput): number => {
  if (keyboard.keyDown['ArrowUp'] || keyboard.keyDown['w']) {
    return 1;
  }

  if (keyboard.keyDown['ArrowDown'] || keyboard.keyDown['s']) {
    return -1;
  }

  return 0;
};

export const accelerateByArrows = (game: Game, playerEntity: Entity): System => {
  const input = game.input;
  const keyboard = input.keyboard;

  return ({ deltaTime }) => {
    const playerArchetype = archetypeByEntity(game.essence, playerEntity);

    if (!playerArchetype) {
      return;
    }

    const accelerationT = tryTable(playerArchetype, Acceleration2);

    if (!accelerationT) {
      return;
    }

    const acceleration = accelerationT[0];

    if (!acceleration) {
      return;
    }

    const speedT = tryTable(playerArchetype, Speed);

    if (!speedT) {
      return;
    }

    const speed = speedT[0];

    if (!speed) {
      return;
    }

    const directionY = getYDirection(keyboard);
    const directionX = getXDirection(keyboard);

    acceleration.y = -speed.value * directionY * deltaTime;
    acceleration.x = -speed.value * directionX * deltaTime;
  };
};

export const changeVelocityByArrows = (game: Game, charEntity: Entity): System => {
  const input = game.input;
  const keyboard = input.keyboard;

  return ({ deltaTime }) => {
    const charArchetype = archetypeByEntity(game.essence, charEntity);

    if (!charArchetype) {
      return;
    }

    const velocityT = tryTable(charArchetype, Velocity2);

    if (!velocityT) {
      return;
    }

    const velocity = velocityT[0];

    if (!velocity) {
      return;
    }

    const speedT = tryTable(charArchetype, Speed);

    if (!speedT) {
      return;
    }

    const speed = speedT[0];

    if (!speed) {
      return;
    }

    const directionY = getYDirection(keyboard);
    const directionX = getXDirection(keyboard);

    velocity.y = -speed.value * directionY * deltaTime;
    velocity.x = -speed.value * directionX * deltaTime;
  };
};

const characterVelocityQ = newQuery(Position2, Pivot2);

export const applyGOWorldBoundaries = (game: Game): System => {
  const query = registerQuery(game.essence, characterVelocityQ);

  return ({ deltaTime }) => {
    for (let i = 0; i < query.archetypes.length; i++) {
      const archetype = query.archetypes[i];
      const positionT = table(archetype, Position2);
      // const sizeT = table(archetype, Size2);
      const pivotT = table(archetype, Pivot2);

      for (let j = 0; j < archetype.entities.length; j++) {
        // const position = positionT[j];
        // const size = sizeT[j];
        // const pivot = pivotT[j];
        // if (position.x - pivot.x < 0) {
        //   position.x = pivot.x;
        // }
        // if (position.y - pivot.y < 0) {
        //   position.y = pivot.y;
        // }
        // if (position.x + size.width - pivot.x > game.world.size.width) {
        //   position.x = game.world.size.width - size.width + pivot.x;
        // }
        // if (position.y + size.height - pivot.y > game.world.size.height) {
        //   position.y = game.world.size.height - size.height + pivot.y;
        // }
      }
    }
  };
};

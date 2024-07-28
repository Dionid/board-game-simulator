import { archetypeByEntity, Entity, newTag, System, tryTable } from 'libs/tecs';
import {
  KeyBoardInput,
  Acceleration2,
  Speed,
  Velocity2,
  normalizeV2,
  multScalarV2,
  mutMultScalarV2,
} from 'libs/tengine/core';
import { Game } from 'libs/tengine/game';

// export const GameObject = newTag();

export const Player = newTag();
export const Enemy = newTag();
export const Ball = newTag();

export type Directions = 'up' | 'down' | 'left' | 'right';

const getXDirection = (keyboard: KeyBoardInput): number => {
  if (keyboard.keyDown['ArrowRight'] || keyboard.keyDown['d']) {
    return 1;
  }

  if (keyboard.keyDown['ArrowLeft'] || keyboard.keyDown['a']) {
    return -1;
  }

  return 0;
};

const getYDirection = (keyboard: KeyBoardInput): number => {
  if (keyboard.keyDown['ArrowUp'] || keyboard.keyDown['w']) {
    return -1;
  }

  if (keyboard.keyDown['ArrowDown'] || keyboard.keyDown['s']) {
    return 1;
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

    const newAcc = normalizeV2({
      x: speed.value * directionX,
      y: speed.value * directionY,
    });
    mutMultScalarV2(newAcc, speed.value);

    acceleration.x = newAcc.x * deltaTime;
    acceleration.y = newAcc.y * deltaTime;
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

    const newVel = normalizeV2({
      x: speed.value * directionX,
      y: speed.value * directionY,
    });
    mutMultScalarV2(newVel, speed.value);

    velocity.x = newVel.x * deltaTime;
    velocity.y = newVel.y * deltaTime;
  };
};

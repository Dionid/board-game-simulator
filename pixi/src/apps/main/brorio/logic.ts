import { componentByEntity, Entity, newQuery, newTag, registerQuery, System } from 'libs/tecs';
import { ColliderBody, castRayByQuery } from 'libs/tengine/collision';
import {
  KeyBoardInput,
  Acceleration2,
  Velocity2,
  Position2,
  Speed,
  Size2,
} from 'libs/tengine/core';
import { Game } from 'libs/tengine/game';

export const DeathZone = newTag();
export const Player = newTag();

const getXDirection = (keyboard: KeyBoardInput): number => {
  if (keyboard.keyDown['ArrowRight'] || keyboard.keyDown['d']) {
    return 1;
  }

  if (keyboard.keyDown['ArrowLeft'] || keyboard.keyDown['a']) {
    return -1;
  }

  return 0;
};

export const playerMovement = (game: Game, playerEntity: Entity, characterSize: Size2): System => {
  const colliderBodiesQ = registerQuery(game.essence, newQuery(ColliderBody));

  let lastGroundedTime = 0;
  let lastJumpTime = 0;

  return ({ deltaTime, elapsedTime }) => {
    const acceleration = componentByEntity(game.essence, playerEntity, Acceleration2);
    const velocity = componentByEntity(game.essence, playerEntity, Velocity2);
    const position = componentByEntity(game.essence, playerEntity, Position2);
    const speed = componentByEntity(game.essence, playerEntity, Speed);

    if (!velocity || !acceleration || !position || !speed) {
      return;
    }

    const groundCollision = castRayByQuery(
      colliderBodiesQ,
      {
        x: position.x,
        y: position.y + characterSize.height / 2 + 0.1,
      },
      {
        x: position.x,
        y: position.y + characterSize.height / 2 + 0.2,
      },
      {
        width: characterSize.width - 2,
        stopOnFirst: true,
      }
    );

    const isGrounded = groundCollision.length > 0;

    if (isGrounded) {
      lastGroundedTime = elapsedTime;
    }

    // # Apply gravity
    if (isGrounded) {
      velocity.y = 0;
    } else {
      velocity.y += 0.3 * deltaTime;
    }

    // velocity.y += 0.3 * deltaTime;

    // # Jump + Coyote jump
    const jump = game.input.keyboard.keyDown['w'];
    if (jump) {
      lastJumpTime = elapsedTime;
    }

    // TODO: change to frame time not ms time
    if (jump || elapsedTime - lastJumpTime < 50) {
      if (isGrounded || (velocity.y > 0 && elapsedTime - lastGroundedTime < 75)) {
        velocity.y = -5 * deltaTime;
      }
    }

    const directionX = getXDirection(game.input.keyboard);

    velocity.x = speed.value * directionX * deltaTime;

    if (velocity.x !== 0) {
      const startX = position.x + (characterSize.width / 2 + 0.1) * directionX;

      const directionCollision = castRayByQuery(
        colliderBodiesQ,
        {
          x: startX,
          y: position.y,
        },
        {
          x: startX + velocity.x,
          y: position.y,
        },
        {
          width: characterSize.height - 4,
          stopOnFirst: true,
        }
      );

      if (directionCollision.length > 0) {
        velocity.x = 0;
      }
    }
  };
};

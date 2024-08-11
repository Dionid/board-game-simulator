import {
  componentByEntity,
  Entity,
  newQuery,
  newTag,
  newTopic,
  registerQuery,
  System,
} from 'libs/tecs';
import { ColliderBody, CollidingEvent, castRayByQuery } from 'libs/tengine/collision';
import {
  KeyBoardInput,
  Acceleration2,
  Velocity2,
  Position2,
  Speed,
  Size2,
  Vector2,
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

export const playerCollisionStartedTopic = newTopic<CollidingEvent>();

export const playerMovement = (
  game: Game,
  playerEntity: Entity,
  characterSize: Size2,
  initialPosition: Vector2
): System => {
  const colliderBodiesQ = registerQuery(game.essence, newQuery(ColliderBody));

  let lastGroundedTime = 0;
  let lastJumpTime = 0;
  const skinWidth = 0.1;

  return ({ deltaTime, elapsedTime }) => {
    const acceleration = componentByEntity(game.essence, playerEntity, Acceleration2);
    const velocity = componentByEntity(game.essence, playerEntity, Velocity2);
    const position = componentByEntity(game.essence, playerEntity, Position2);
    const speed = componentByEntity(game.essence, playerEntity, Speed);

    if (!velocity || !acceleration || !position || !speed) {
      return;
    }

    const groundYOffset = Math.max(velocity.y, 0.2);

    const groundCollision = castRayByQuery(
      colliderBodiesQ,
      {
        x: position.x,
        y: position.y + characterSize.height / 2 + skinWidth,
      },
      {
        x: position.x,
        y: position.y + characterSize.height / 2 + skinWidth + groundYOffset,
      },
      {
        width: characterSize.width - 2,
      }
    );

    const solidGroundCollision = groundCollision.filter((c) => c.collider.type === 'solid');

    const isGrounded = solidGroundCollision.length > 0;

    if (isGrounded) {
      lastGroundedTime = elapsedTime;
      position.y = position.y + groundYOffset - solidGroundCollision[0].overlap;
    }

    // # Apply gravity
    if (isGrounded) {
      velocity.y = 0;
    } else {
      velocity.y += 0.3 * deltaTime;
    }

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

    // # Move X
    const directionX = getXDirection(game.input.keyboard);

    velocity.x = speed.value * directionX * deltaTime;

    if (velocity.x !== 0) {
      const velocitySign = Math.sign(velocity.x);

      const startX = position.x + (characterSize.width / 2 + skinWidth) * velocitySign;

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
          width: characterSize.height - 2,
        }
      );

      const solidDirectionCollision = directionCollision.filter((c) => c.collider.type === 'solid');

      if (solidDirectionCollision.length > 0) {
        position.x = position.x + velocity.x - solidDirectionCollision[0].overlap * velocitySign;
        velocity.x = 0;
      }
    }

    for (const collision of playerCollisionStartedTopic) {
      const { a, b } = collision;

      const player = a.entity === playerEntity ? a : b;
      const other = a.entity === playerEntity ? b : a;

      if (!player) {
        continue;
      }

      if (!player.collider.tags.includes('hitbox')) {
        continue;
      }

      const deathZone = componentByEntity(game.essence, other.entity, DeathZone);

      if (deathZone) {
        console.log('DEATH');
        position.x = initialPosition.x;
        position.y = initialPosition.y;
        lastGroundedTime = 0;
        lastJumpTime = 0;
      }
    }
  };
};

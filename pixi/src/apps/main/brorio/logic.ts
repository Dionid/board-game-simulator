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
import { castShapeAndTakeSolidMaxOverlap } from './character-controller';

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
  initialPosition: Vector2,
  options: {
    autostep?: boolean;
    up?: Vector2;
    skinWidth?: number;
    maxStairsHeight?: number;
    minStairsWidth?: number;
    snapToGroundHeight?: number;
  } = {}
): System => {
  const colliderBodiesQ = registerQuery(game.essence, newQuery(ColliderBody));

  // # General char controller
  // ## UP vector
  const up = options.up ?? { x: 0, y: -1 };

  // ## Skin
  const skinWidth = options.skinWidth ?? 0.1;

  // ## Stairs
  const autostep = options.autostep ?? false;
  const maxStairsHeight = options.maxStairsHeight ?? 0;
  const minStairsWidth = options.minStairsWidth ?? 0;

  // ## Snap to ground
  const snapToGroundHeight = options.snapToGroundHeight ?? 0;

  // # Arcade physics
  // ## Coyote jump
  let wasGrounded = false;
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
        width: characterSize.width,
      }
    );

    let maxOverlap = 0;
    let isGrounded = false;

    for (const collision of groundCollision) {
      if (collision.collider.type !== 'solid') {
        continue;
      }
      isGrounded = true;
      if (collision.overlap > maxOverlap) {
        maxOverlap = collision.overlap;
      }
    }

    if (maxOverlap !== 0) {
      lastGroundedTime = elapsedTime;
      position.y += -skinWidth + groundYOffset - maxOverlap;
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

    // # Snap to ground
    if (snapToGroundHeight > 0 && !isGrounded && wasGrounded && velocity.y > 0) {
      const [stgMaxOverlap] = castShapeAndTakeSolidMaxOverlap(
        colliderBodiesQ,
        {
          x: position.x,
          y: position.y + (characterSize.height / 2 + skinWidth) * -up.y,
        },
        {
          x: position.x,
          y: position.y + (characterSize.height / 2 + skinWidth + snapToGroundHeight) * -up.y,
        },
        {
          width: characterSize.width,
        }
      );

      if (stgMaxOverlap !== 0) {
        position.y += (snapToGroundHeight - skinWidth - stgMaxOverlap) * -up.y;
        velocity.y = 0;
        isGrounded = true;
      }
    }

    // # Move X
    const directionX = getXDirection(game.input.keyboard);

    velocity.x = speed.value * directionX * deltaTime;

    if (velocity.x !== 0) {
      const directionSign = Math.sign(velocity.x);

      const startX = position.x + (characterSize.width / 2) * directionSign;

      let [maxOverlap] = castShapeAndTakeSolidMaxOverlap(
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
          width: characterSize.height,
        }
      );

      if (maxOverlap !== 0) {
        // # Stairs
        if (isGrounded && autostep) {
          const stairsOverlap = castRayByQuery(
            colliderBodiesQ,
            {
              x: startX,
              y: position.y + (skinWidth + maxStairsHeight) * up.y,
            },
            {
              x: startX + minStairsWidth * directionSign,
              y: position.y + (skinWidth + maxStairsHeight) * up.y,
            },
            {
              width: characterSize.height,
            }
          );

          if (stairsOverlap.length === 0) {
            position.y -= maxStairsHeight + skinWidth;
          } else {
            position.x = position.x + velocity.x - maxOverlap * directionSign;
            velocity.x = 0;
          }
        } else {
          position.x = position.x + velocity.x - maxOverlap * directionSign;
          velocity.x = 0;
        }
      }
    }

    for (const collision of playerCollisionStartedTopic) {
      const { a, b } = collision;

      const player = a.entity === playerEntity ? a : b;
      const other = a.entity === playerEntity ? b : a;

      if (!player) {
        continue;
      }

      // # Death zone
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

    // console.log('isGrounded', isGrounded, velocity.y);

    wasGrounded = isGrounded;
  };
};

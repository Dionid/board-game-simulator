import { componentByEntity, Entity, newQuery, newTag, newTopic, registerQuery } from 'libs/tecs';
import { ColliderBody, CollidingEvent } from 'libs/tengine/collision';
import { castRayClosestByQuery } from 'libs/tengine/collision/ray';
import {
  Acceleration2,
  KeyBoardInput,
  normalizeV2,
  Position2,
  Size2,
  Speed,
  Vector2,
  Velocity2,
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
  initialPosition: Vector2,
  options: {
    autostep?: boolean;
    up?: Vector2;
    skinWidth?: number;
    maxStairsHeight?: number;
    minStairsWidth?: number;
    snapToGroundHeight?: number;
  } = {}
) => {
  const colliderBodiesQ = registerQuery(game.essence, newQuery(ColliderBody));

  const up = options.up ?? { x: 0, y: -1 };
  const skinWidth = options.skinWidth ?? 0.1;

  return () => {
    const acceleration = componentByEntity(game.essence, playerEntity, Acceleration2);
    const velocity = componentByEntity(game.essence, playerEntity, Velocity2);
    const position = componentByEntity(game.essence, playerEntity, Position2);
    const speed = componentByEntity(game.essence, playerEntity, Speed);

    if (!velocity || !acceleration || !position || !speed) {
      return;
    }

    const result = castRayClosestByQuery(
      colliderBodiesQ,
      {
        origin: { x: position.x, y: position.y + characterSize.height / 2 + skinWidth },
        direction: normalizeV2({ x: 0, y: 1 }),
      },
      {
        notSelf: playerEntity,
        maxDistance: 140,
      }
    );

    if (result) {
      console.log('result', result);
      // debugger;
    }
  };
};

// export const playerMovement = (
//   game: Game,
//   playerEntity: Entity,
//   characterSize: Size2,
//   initialPosition: Vector2,
//   options: {
//     autostep?: boolean;
//     up?: Vector2;
//     skinWidth?: number;
//     maxStairsHeight?: number;
//     minStairsWidth?: number;
//     snapToGroundHeight?: number;
//   } = {}
// ): System => {
//   const colliderBodiesQ = registerQuery(game.essence, newQuery(ColliderBody));

//   // # General char controller
//   // ## UP vector
//   const up = options.up ?? { x: 0, y: -1 };

//   // ## Skin
//   const skinWidth = options.skinWidth ?? 0.1;

//   // ## Stairs
//   const autostep = options.autostep ?? false;
//   const maxStairsHeight = options.maxStairsHeight ?? 0;
//   const minStairsWidth = options.minStairsWidth ?? 0;

//   // ## Snap to ground
//   const snapToGroundHeight = options.snapToGroundHeight ?? 0;

//   // # Arcade physics
//   // ## Coyote jump
//   let wasGrounded = false;
//   let lastGroundedTime = 0;
//   let lastJumpTime = 0;

//   return ({ deltaTime, elapsedTime }) => {
//     const acceleration = componentByEntity(game.essence, playerEntity, Acceleration2);
//     const velocity = componentByEntity(game.essence, playerEntity, Velocity2);
//     const position = componentByEntity(game.essence, playerEntity, Position2);
//     const speed = componentByEntity(game.essence, playerEntity, Speed);

//     if (!velocity || !acceleration || !position || !speed) {
//       return;
//     }

//     // # Grounded
//     const groundLength = 5;

//     const [groundedMaxOverlap] = castRayAndTakeSolidMaxOverlap(
//       colliderBodiesQ,
//       {
//         x: position.x,
//         y: position.y + (characterSize.height / 2 + skinWidth) * -up.y,
//       },
//       {
//         x: position.x,
//         y: position.y + (characterSize.height / 2 + skinWidth + groundLength) * -up.y,
//       },
//       {
//         width: characterSize.width,
//         notSelf: playerEntity,
//       }
//     );

//     let isGrounded = groundedMaxOverlap > 0;
//     if (isGrounded) {
//       lastGroundedTime = elapsedTime;
//     }

//     // ## Custom logic
//     // # Apply gravity
//     velocity.y += 0.5 * deltaTime;

//     // # Jump + Coyote jump
//     const jump = game.input.keyboard.keyDown['w'];
//     if (jump) {
//       lastJumpTime = elapsedTime;
//     }

//     // TODO: change to frame time not ms time
//     if (jump || elapsedTime - lastJumpTime < 50) {
//       if (isGrounded || (velocity.y > 0 && elapsedTime - lastGroundedTime < 75)) {
//         velocity.y = -10 * deltaTime;
//       }
//     }

//     // # Move X by input
//     const directionX = getXDirection(game.input.keyboard);
//     velocity.x = speed.value * directionX * deltaTime;

//     for (const collision of playerCollisionStartedTopic) {
//       const { a, b } = collision;

//       const player = a.entity === playerEntity ? a : b;
//       const other = a.entity === playerEntity ? b : a;

//       if (!player) {
//         continue;
//       }

//       // # Death zone
//       if (!player.collider.tags.includes('hitbox')) {
//         continue;
//       }

//       const deathZone = componentByEntity(game.essence, other.entity, DeathZone);

//       if (deathZone) {
//         position.x = initialPosition.x;
//         position.y = initialPosition.y;
//         lastGroundedTime = 0;
//         lastJumpTime = 0;

//         return;
//       }
//     }

//     // # Move & Slide

//     // # Snap to ground
//     if (snapToGroundHeight > 0 && !isGrounded && wasGrounded && velocity.y > 0) {
//       const [stgMaxOverlap] = castRayAndTakeSolidMaxOverlap(
//         colliderBodiesQ,
//         {
//           x: position.x,
//           y: position.y + (characterSize.height / 2 + skinWidth) * -up.y,
//         },
//         {
//           x: position.x,
//           y: position.y + (characterSize.height / 2 + skinWidth + snapToGroundHeight) * -up.y,
//         },
//         {
//           width: characterSize.width,
//           notSelf: playerEntity,
//         }
//       );

//       if (stgMaxOverlap !== 0) {
//         position.y += (snapToGroundHeight - stgMaxOverlap) * -up.y;
//         velocity.y = 0;
//         isGrounded = true;
//       }
//     }

//     // # Move Y
//     if (velocity.y !== 0) {
//       const directionSign = Math.sign(velocity.y);

//       const startY = position.y + (characterSize.height / 2 + skinWidth) * directionSign;

//       let [yObstaclesMaxOverlap] = castRayAndTakeSolidMaxOverlap(
//         colliderBodiesQ,
//         {
//           x: position.x,
//           y: startY,
//         },
//         {
//           x: position.x,
//           y: startY + velocity.y,
//         },
//         {
//           width: characterSize.width,
//           notSelf: playerEntity,
//         }
//       );

//       if (yObstaclesMaxOverlap !== 0) {
//         position.y = position.y + velocity.y - yObstaclesMaxOverlap * directionSign;
//         velocity.y = 0;
//       }
//     }

//     // # Move X
//     if (velocity.x !== 0) {
//       const directionSign = Math.sign(velocity.x);

//       const startX = position.x + (characterSize.width / 2 + skinWidth) * directionSign;

//       let [xObstaclesMaxOverlap] = castRayAndTakeSolidMaxOverlap(
//         colliderBodiesQ,
//         {
//           x: startX,
//           y: position.y,
//         },
//         {
//           x: startX + velocity.x,
//           y: position.y,
//         },
//         {
//           width: characterSize.height,
//           notSelf: playerEntity,
//         }
//       );

//       if (xObstaclesMaxOverlap !== 0) {
//         // # Stairs
//         if (isGrounded && autostep) {
//           const stairsOverlap = castRayByQuery(
//             colliderBodiesQ,
//             {
//               x: startX,
//               y: position.y + (skinWidth + maxStairsHeight) * up.y,
//             },
//             {
//               x: startX + minStairsWidth * directionSign,
//               y: position.y + (skinWidth + maxStairsHeight) * up.y,
//             },
//             {
//               width: characterSize.height,
//               notSelf: playerEntity,
//             }
//           );

//           if (stairsOverlap.length === 0) {
//             position.y -= maxStairsHeight + skinWidth;
//           } else {
//             position.x = position.x + velocity.x - xObstaclesMaxOverlap * directionSign;
//             velocity.x = 0;
//           }
//         } else {
//           position.x = position.x + velocity.x - xObstaclesMaxOverlap * directionSign;
//           velocity.x = 0;
//         }
//       }
//     }

//     wasGrounded = isGrounded;
//   };
// };

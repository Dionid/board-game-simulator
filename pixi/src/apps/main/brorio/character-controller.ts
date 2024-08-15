import { Entity, Query, SchemaToType } from 'libs/tecs';
import {
  castShapeByQuery,
  Collider,
  ColliderBody,
  rectangleColliderComponent,
} from 'libs/tengine/collision';
import { Size2, Vector2 } from 'libs/tengine/core';

// export function castShapeAndTakeSolidMaxOverlap(
//   query: Query<[typeof ColliderBody]>,
//   shape: SchemaToType<typeof ColliderBody>,
//   velocity: Vector2,
//   opts: {
//     width?: number;
//     stopOnFirst?: boolean;
//     notSelf?: Entity;
//   } = {}
// ): [0, null, CastingResult[]] | [number, CastingResult, CastingResult[]] {
//   const collisionsList = castShapeByQuery(query, shape, velocity, opts);

//   let maxOverlap = 0;
//   let maxOverlapCollision = null;

//   for (const collision of collisionsList) {
//     if (collision.collider.type !== 'solid') {
//       continue;
//     }
//     if (collision.overlap > maxOverlap) {
//       maxOverlap = collision.overlap;
//       maxOverlapCollision = collision;
//     }
//   }

//   if (maxOverlap === 0 || maxOverlapCollision === null) {
//     return [0, null, collisionsList];
//   }

//   return [maxOverlap, maxOverlapCollision, collisionsList];
// }

export type CharacterController = {
  characterEntity: Entity;
  isGrounded: boolean;
  wasGrounded: boolean;
  lastGroundedTime: number;
  up: Vector2;
  skinWidth: number;
  groundCheckZoneHeight: number;
};

export function newCharacterController(
  characterEntity: Entity,
  opts: {
    up?: Vector2;
    skinWidth?: number;
    groundCheckZoneHeight?: number;
    isGrounded?: boolean;
    wasGrounded?: boolean;
    lastGroundedTime?: number;
  } = {}
): CharacterController {
  return {
    characterEntity,
    isGrounded: opts.isGrounded ?? false,
    wasGrounded: opts.wasGrounded ?? false,
    lastGroundedTime: opts.lastGroundedTime ?? 0,
    up: opts.up ?? { x: 0, y: -1 },
    skinWidth: opts.skinWidth ?? 0.1,
    groundCheckZoneHeight: opts.groundCheckZoneHeight ?? 1,
  };
}

export function moveAndSlide(
  cc: CharacterController,
  deltaTime: number,
  elapsedTime: number,
  colliderBodiesQuery: Query<[typeof ColliderBody]>,
  characterShape: SchemaToType<typeof Collider>[],
  characterSize: Size2,
  characterCurrentPosition: Vector2,
  characterCurrentVelocity: Vector2,
  opts: {
    up?: Vector2;
    skinWidth?: number;
    groundCheckZoneHeight?: number;
    characterEntity?: Entity;
  } = {}
) {
  const up = opts.up ?? cc.up;
  const skinWidth = opts.skinWidth ?? cc.skinWidth;
  const groundCheckZoneHeight = opts.groundCheckZoneHeight ?? cc.groundCheckZoneHeight;
  const characterEntity = opts.characterEntity ?? cc.characterEntity;

  const correctedVelocity = {
    x: characterCurrentVelocity.x,
    y: characterCurrentVelocity.y,
  };

  // # Ground check
  const groundCollision = castShapeByQuery(
    colliderBodiesQuery,
    [
      rectangleColliderComponent({
        parentPosition: {
          x: characterCurrentPosition.x,
          y: characterCurrentPosition.y + characterSize.height / 2 + skinWidth,
        },
        anchor: { x: 0.5, y: 0 },
        size: { width: characterSize.width, height: groundCheckZoneHeight },
      }),
    ],
    { x: 0, y: characterCurrentVelocity.y },
    {
      notSelf: characterEntity,
      maxToi: 1,
    }
  );

  const isGrounded = groundCollision.length > 0;
  if (isGrounded) {
    cc.lastGroundedTime = elapsedTime;
  }
  cc.isGrounded = isGrounded;

  // # Collisions check
  const collisions = castShapeByQuery(
    colliderBodiesQuery,
    characterShape,
    characterCurrentVelocity,
    {
      notSelf: characterEntity,
      maxToi: 1,
      onlySolid: true,
    }
  );

  for (const collision of collisions) {
    correctedVelocity.x += collision.overlap * collision.axis.x;
    correctedVelocity.y += collision.overlap * collision.axis.y;
  }

  // if (characterCurrentVelocity.x !== 0) {
  // const xDirectionSign = Math.sign(characterCurrentVelocity.x);

  // const startX =
  //   characterCurrentPosition.x - (characterSize.width / 2 + skinWidth) * directionSign;
  // const newX = startX + characterCurrentVelocity.x;

  // let [xObstaclesMaxOverlap] = castRayAndTakeSolidMaxOverlap(
  //   colliderBodiesQuery,
  //   {
  //     x: newX,
  //     y: characterCurrentPosition.y,
  //   },
  //   {
  //     x: newX,
  //     y: characterCurrentPosition.y,
  //   },
  //   {
  //     width: characterSize.height,
  //     notSelf: characterEntity,
  //   }
  // );

  // if (xObstaclesMaxOverlap !== 0) {
  // # Stairs
  // if (isGrounded && autostep) {
  //   const stairsOverlap = castRayByQuery(
  //     colliderBodiesQ,
  //     {
  //       x: startX,
  //       y: characterCurrentPosition.y + (skinWidth + maxStairsHeight) * up.y,
  //     },
  //     {
  //       x: startX + minStairsWidth * directionSign,
  //       y: characterCurrentPosition.y + (skinWidth + maxStairsHeight) * up.y,
  //     },
  //     {
  //       width: characterSize.height,
  //       notSelf: playerEntity,
  //     }
  //   );

  //   if (stairsOverlap.length === 0) {
  //     characterCurrentPosition.y -= maxStairsHeight + skinWidth;
  //   } else {
  //     characterCurrentPosition.x = characterCurrentPosition.x + characterCurrentVelocity.x - xObstaclesMaxOverlap * directionSign;
  //     characterCurrentVelocity.x = 0;
  //   }
  // } else {
  // characterCurrentPosition.x =
  //   characterCurrentPosition.x +
  //   characterCurrentVelocity.x -
  //   xObstaclesMaxOverlap * directionSign;
  // characterCurrentVelocity.x = 0;
  // }
  // }
  // }

  cc.wasGrounded = isGrounded;

  return correctedVelocity;
}

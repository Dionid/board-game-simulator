import { Entity, Query, SchemaToType } from 'libs/tecs';
import {
  castShapeByQuery,
  Collider,
  ColliderBody,
  rectangleColliderComponent,
} from 'libs/tengine/collision';
import { Vector2 } from 'libs/tengine/core';
import { bb2FromVert2List } from 'libs/tengine/core/bounding-box';

export type CharacterController = {
  characterEntity: Entity;
  isGrounded: boolean;
  wasGrounded: boolean;
  lastGroundedTime: number;
  up: Vector2;
  skinWidth: number;
  groundCheckZoneHeight: number;
  _initial: Omit<CharacterController, '_initial'>;
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
  const cc = {
    characterEntity,
    isGrounded: opts.isGrounded ?? false,
    wasGrounded: opts.wasGrounded ?? false,
    lastGroundedTime: opts.lastGroundedTime ?? 0,
    up: opts.up ?? { x: 0, y: -1 },
    skinWidth: opts.skinWidth ?? 0.1,
    groundCheckZoneHeight: opts.groundCheckZoneHeight ?? 1,
  };

  return {
    ...cc,
    _initial: { ...cc },
  };
}

export function resetCharacterController(cc: CharacterController) {
  const { _initial } = cc;
  cc.isGrounded = _initial.isGrounded;
  cc.wasGrounded = _initial.wasGrounded;
  cc.lastGroundedTime = _initial.lastGroundedTime;
  cc.up = _initial.up;
  cc.skinWidth = _initial.skinWidth;
  cc.groundCheckZoneHeight = _initial.groundCheckZoneHeight;
}

export function moveAndSlide(
  cc: CharacterController,
  elapsedTime: number,
  colliderBodiesQuery: Query<[typeof ColliderBody]>,
  characterShape: SchemaToType<typeof Collider>[],
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
  const shapeBb = bb2FromVert2List(characterShape.map((collider) => collider._vertices));
  const width = shapeBb.max.x - shapeBb.min.x;
  const height = shapeBb.max.y - shapeBb.min.y;

  // QUESTION: maybe check by next position not current?
  const groundCollision = castShapeByQuery(
    colliderBodiesQuery,
    [
      rectangleColliderComponent({
        position: {
          x: characterCurrentPosition.x,
          y: characterCurrentPosition.y + (height / 2 + skinWidth) * -up.y,
        },
        size: {
          width: width,
          height: groundCheckZoneHeight,
        },
      }),
    ],
    {
      x: -up.x * groundCheckZoneHeight,
      y: -up.y * groundCheckZoneHeight,
    },
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

  // TODO: add skinWidth to shape
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

  // # Resolve penetration
  for (const collision of collisions) {
    correctedVelocity.x += collision.overlap * collision.axis.x;
    correctedVelocity.y += collision.overlap * collision.axis.y;
  }

  // # Invalidate
  cc.wasGrounded = isGrounded;

  return correctedVelocity;
}

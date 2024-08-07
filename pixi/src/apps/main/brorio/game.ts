import { activateDebugMode } from 'libs/tengine/debug';
import { newGame, initGame } from 'libs/tengine/game';
import { Container } from 'pixi.js';
import { registerSystem, setComponent, spawnEntity } from 'libs/tecs';
import {
  awakening,
  checkNarrowCollisionSimple,
  circleColliderComponent,
  ColliderBody,
  CollisionsMonitoring,
  filterCollisionEvents,
  penetrationResolution,
  rectangleColliderComponent,
  transformCollider,
} from 'libs/tengine/collision';
import { addNewViews, drawViews, View } from 'libs/tengine/render';
import { mapKeyboardInput, mapMouseInput } from 'libs/tengine/ecs';
import { updatePrevious } from 'libs/tengine/core/update-previous';
import {
  AffectedByGravity,
  applyGravityToAcceleration,
  applyRigidBodyAccelerationToVelocity,
  applyRigidBodyFriction,
  applyRigidBodyVelocityToPosition,
  Kinematic,
  RigidBody,
} from 'libs/tengine/physics';
import { initMap } from './map';
import { Player } from './logic';
import { Position2, Speed, Acceleration2, Friction, Velocity2 } from 'libs/tengine/core';
import { COLLIDER_GROUND_DETECTOR_TAG, GroundDetection, isGrounded } from 'libs/tengine/controls';

export async function initSuperMarioLikeGame(parentElement: HTMLElement) {
  const game = newGame({
    canvas: {
      parentElement,
      resizeTo: window,
    },
  });

  activateDebugMode(game);

  await initGame(game, {
    backgroundColor: 0x000000,
  });

  const map = await initMap(game);

  game.world.container.addChild(map.container);

  // # Player
  const playerEntity = spawnEntity(game.essence);
  setComponent(game.essence, playerEntity, Player);
  const characterSize = {
    width: 16,
    height: 16,
  };
  // ## View
  setComponent(game.essence, playerEntity, View, {
    offset: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    anchor: { x: 0.5, y: 0.5 },
    alpha: 1,
    model: {
      type: 'graphics',
      shape: {
        type: 'rectangle',
        size: characterSize,
      },
      color: '0xFFFFFF',
    },
  });
  // ## Position
  const initialPlayerPosition = {
    x: 50,
    y: 100,
  };
  const playerPosition = {
    x: initialPlayerPosition.x,
    y: initialPlayerPosition.y,
    _prev: { x: initialPlayerPosition.x, y: initialPlayerPosition.y },
  };
  setComponent(game.essence, playerEntity, Position2, playerPosition);
  setComponent(game.essence, playerEntity, Speed, { value: 1 });
  setComponent(game.essence, playerEntity, Acceleration2, {
    x: 0,
    y: 0,
  });
  setComponent(game.essence, playerEntity, Friction, {
    value: 0.1,
  });
  setComponent(game.essence, playerEntity, Velocity2, {
    max: 20,
    x: 0,
    y: 0,
  });
  setComponent(game.essence, playerEntity, CollisionsMonitoring);
  const playerRadius = 8;
  setComponent(game.essence, playerEntity, ColliderBody, {
    parts: [
      circleColliderComponent({
        parentPosition: playerPosition,
        radius: playerRadius,
      }),
      rectangleColliderComponent({
        parentPosition: playerPosition,
        offset: {
          x: 0,
          y: playerRadius,
        },
        type: 'sensor',
        size: {
          width: playerRadius * 2,
          height: 1,
        },
        tags: [COLLIDER_GROUND_DETECTOR_TAG],
      }),
    ],
  });
  setComponent(game.essence, playerEntity, RigidBody, {
    elasticity: 0,
    elasticityMode: 'average',
  });
  setComponent(game.essence, playerEntity, Kinematic);
  setComponent(game.essence, playerEntity, AffectedByGravity, {
    scale: 1,
  });
  setComponent(game.essence, playerEntity, GroundDetection);

  // # Systems
  // ## Previous invalidation
  registerSystem(game.essence, updatePrevious(game));

  // ## Input
  registerSystem(game.essence, mapKeyboardInput(game));
  registerSystem(game.essence, mapMouseInput(game, map));

  // ## Basic physics
  registerSystem(game.essence, applyGravityToAcceleration(game, { x: 0, y: 0.001 }));
  registerSystem(game.essence, applyRigidBodyAccelerationToVelocity(game));
  registerSystem(game.essence, applyRigidBodyFriction(game, 0.01));
  registerSystem(game.essence, applyRigidBodyVelocityToPosition(game));

  // ## Game logic
  // registerSystem(game.essence, () => {
  //   const isGroundedC = componentByEntity(game.essence, playerEntity, IsGrounded);
  //   const acceleration = componentByEntity(game.essence, playerEntity, Acceleration2);
  //   const velocity = componentByEntity(game.essence, playerEntity, Velocity2);

  //   if (!isGroundedC || !acceleration || !velocity) {
  //     return;
  //   }

  //   removeComponent(game.essence, playerEntity, AffectedByGravity);
  //   acceleration.x = 0;
  //   acceleration.y = 0;
  //   velocity.x = 0;
  //   velocity.y = 0;
  // });

  // ## Collision
  // ### Transform
  registerSystem(game.essence, transformCollider(game));

  // ### Calculate collisions
  registerSystem(game.essence, awakening(game));
  registerSystem(game.essence, checkNarrowCollisionSimple(game));
  registerSystem(game.essence, filterCollisionEvents(game));
  registerSystem(game.essence, penetrationResolution(game));

  // ## Is grounded
  registerSystem(game.essence, isGrounded());

  // ## Render
  const viewContainer = new Container();
  map.container.addChild(viewContainer);

  registerSystem(game.essence, addNewViews(game, viewContainer));
  registerSystem(game.essence, drawViews(game));

  return game;
}

import { activateDebugMode } from 'libs/tengine/debug';
import { newGame, initGame, setGlobalScale } from 'libs/tengine/game';
import { Container } from 'pixi.js';
import { emit, registerSystem, registerTopic, setComponent, spawnEntity } from 'libs/tecs';
import {
  awakening,
  checkNarrowCollisionSimple,
  circleColliderComponent,
  ColliderBody,
  CollisionsMonitoring,
  collisionStartedTopic,
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
  applyGravity,
  applyRigidBodyAccelerationToVelocity,
  applyRigidBodyForceToAcceleration,
  applyRigidBodyFriction,
  applyRigidBodyImpulseToVelocity,
  applyRigidBodyVelocityToPosition,
  dynamicRigidBodyCollisionResolution,
  Force2,
  Impulse2,
  Kinematic,
  resetForce,
  resetImpulse,
  RigidBody,
} from 'libs/tengine/physics';
import { initMap } from './map';
import { Player, playerCollisionStartedTopic, playerMovement } from './logic';
import {
  Position2,
  Speed,
  Acceleration2,
  Friction,
  Velocity2,
  resetMass,
  Mass,
} from 'libs/tengine/core';
import { GroundDetection } from 'libs/tengine/controls';
import { addCollisionMassToMass } from 'libs/tengine/collision/mass';

export async function initSuperMarioLikeGame(parentElement: HTMLElement) {
  const game = newGame({
    canvas: {
      parentElement,
      resizeTo: window,
    },
  });

  setGlobalScale(game, 2);

  activateDebugMode(game, {
    render: {
      // collision: false,
      // castings: false,
      collisionPivot: false,
      view: false,
      // velocity: false,
      xy: false,
    },
    events: {
      componentAdded: false,
      componentRemoved: false,
      entitySpawned: false,
    },
  });

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
    height: 24,
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
    x: 60,
    y: 50,
  };
  const playerPosition = {
    x: initialPlayerPosition.x,
    y: initialPlayerPosition.y,
    _prev: { x: initialPlayerPosition.x, y: initialPlayerPosition.y },
  };
  setComponent(game.essence, playerEntity, Position2, playerPosition);
  setComponent(game.essence, playerEntity, Mass, { value: 0 });
  setComponent(game.essence, playerEntity, Speed, { value: 2 });
  setComponent(game.essence, playerEntity, Force2, {
    x: 0,
    y: 0,
  });
  setComponent(game.essence, playerEntity, Impulse2, {
    x: 0,
    y: 0,
  });
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
  const playerRadius = 7;
  setComponent(game.essence, playerEntity, ColliderBody, {
    parts: [
      // circleColliderComponent({
      //   parentPosition: playerPosition,
      //   radius: playerRadius - 1,
      //   mass: 1,
      //   offset: { x: 0, y: 0 },
      //   tags: ['hitbox'],
      // }),
      rectangleColliderComponent({
        parentPosition: playerPosition,
        size: characterSize,
        mass: 1,
        offset: { x: 0, y: 0 },
      }),
    ],
  });
  // setComponent(game.essence, playerEntity, Impenetrable);
  setComponent(game.essence, playerEntity, RigidBody, {
    elasticity: 0,
    elasticityMode: 'min',
  });
  setComponent(game.essence, playerEntity, Kinematic);
  // setComponent(game.essence, playerEntity, Dynamic);
  setComponent(game.essence, playerEntity, AffectedByGravity, {
    scale: 0,
  });
  setComponent(game.essence, playerEntity, GroundDetection);

  // # Circle collision
  const circleEntity = spawnEntity(game.essence);
  const circlePosition = {
    x: 30,
    y: 60,
    _prev: { x: 100, y: 100 },
  };
  setComponent(game.essence, circleEntity, Position2, circlePosition);
  setComponent(game.essence, circleEntity, ColliderBody, {
    parts: [
      circleColliderComponent({
        parentPosition: circlePosition,
        radius: playerRadius - 1,
        mass: 1,
        offset: { x: 0, y: playerRadius },
      }),
    ],
  });

  // # Systems

  // ## Event routing
  registerTopic(game.essence, playerCollisionStartedTopic);
  registerSystem(game.essence, () => {
    for (const event of collisionStartedTopic) {
      const { a, b } = event;

      const player = a.entity === playerEntity ? a : b;

      if (player) {
        emit(playerCollisionStartedTopic, event);
      }
    }
  });

  // ## Input
  registerSystem(game.essence, mapKeyboardInput(game));
  registerSystem(game.essence, mapMouseInput(game, map));

  // ## Previous invalidation
  registerSystem(game.essence, updatePrevious(game));
  registerSystem(game.essence, resetMass(game.essence));

  // ## Pre calcs
  registerSystem(game.essence, addCollisionMassToMass(game));

  // ## Fixed Update
  registerSystem(
    game.essence,
    playerMovement(
      game,
      playerEntity,
      {
        width: characterSize.width - 1,
        height: characterSize.height - 1,
      },
      initialPlayerPosition
    )
  );

  // ## Physics
  // ### Gravity
  registerSystem(game.essence, applyGravity(game, { x: 0, y: 0.01 }));

  // ### Move to new position
  registerSystem(game.essence, applyRigidBodyForceToAcceleration(game));
  registerSystem(game.essence, applyRigidBodyImpulseToVelocity(game));
  registerSystem(game.essence, applyRigidBodyAccelerationToVelocity(game));
  registerSystem(game.essence, applyRigidBodyFriction(game, 0.01));
  registerSystem(game.essence, applyRigidBodyVelocityToPosition(game));

  // ### Reset physics props
  registerSystem(game.essence, resetForce(game));
  registerSystem(game.essence, resetImpulse(game));

  // ## Collision
  // ### Transform
  registerSystem(game.essence, transformCollider(game));

  // ### Calculate collisions
  registerSystem(game.essence, awakening(game));
  registerSystem(game.essence, checkNarrowCollisionSimple(game));
  registerSystem(game.essence, filterCollisionEvents(game));
  registerSystem(game.essence, penetrationResolution(game));
  registerSystem(game.essence, dynamicRigidBodyCollisionResolution(game));

  // ## Render
  const viewContainer = new Container();
  map.container.addChild(viewContainer);

  registerSystem(game.essence, addNewViews(game, viewContainer));
  registerSystem(game.essence, drawViews(game));

  return game;
}

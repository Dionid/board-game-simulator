import { activateDebugMode } from 'libs/tengine/debug';
import { newGame, initGame } from 'libs/tengine/game';
import { Container } from 'pixi.js';
import { registerSystem, setComponent, spawnEntity } from 'libs/tecs';
import {
  awakening,
  checkNarrowCollisionSimple,
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
  applyRigidBodyAccelerationToVelocity,
  applyRigidBodyFriction,
  applyRigidBodyVelocityToPosition,
  Kinematic,
  RigidBody,
} from 'libs/tengine/physics';
import { initMap } from './map';
import { Player } from './logic';
import { Position2, Speed, Acceleration2, Friction, Velocity2 } from 'libs/tengine/core';

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
    max: 10,
    x: 0,
    y: 0,
  });
  setComponent(game.essence, playerEntity, CollisionsMonitoring);
  setComponent(game.essence, playerEntity, ColliderBody, {
    parts: [
      rectangleColliderComponent({
        parentPosition: playerPosition,
        type: 'solid',
        mass: 1,
        offset: { x: 0, y: 0 },
        angle: 0,
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        size: characterSize,
      }),
    ],
  });
  setComponent(game.essence, playerEntity, RigidBody, {
    elasticity: 0,
    elasticityMode: 'average',
  });
  setComponent(game.essence, playerEntity, Kinematic);

  // # Systems
  // ## Previous invalidation
  registerSystem(game.essence, updatePrevious(game));

  // ## Input
  registerSystem(game.essence, mapKeyboardInput(game));
  registerSystem(game.essence, mapMouseInput(game, map));

  // ## Basic physics
  registerSystem(game.essence, applyRigidBodyAccelerationToVelocity(game));
  registerSystem(game.essence, applyRigidBodyFriction(game, 0.01));
  registerSystem(game.essence, applyRigidBodyVelocityToPosition(game));

  // ## Game logic
  // ...

  // ## Collision
  // ### Transform
  registerSystem(game.essence, transformCollider(game));

  // ### Calculate collisions
  registerSystem(game.essence, awakening(game));
  registerSystem(game.essence, checkNarrowCollisionSimple(game));
  registerSystem(game.essence, filterCollisionEvents(game));
  registerSystem(game.essence, penetrationResolution(game));

  // ## Render
  const viewContainer = new Container();
  map.container.addChild(viewContainer);

  registerSystem(game.essence, addNewViews(game, viewContainer));
  registerSystem(game.essence, drawViews(game));

  return game;
}

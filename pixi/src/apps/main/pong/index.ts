import { Container } from 'pixi.js';
import { initGame, newGame } from '../../../libs/tengine/game';
import { registerSystem, setComponent, spawnEntity } from '../../../libs/tecs';
import { mapKeyboardInput, mapMouseInput } from '../../../libs/tengine/ecs';
import { Dynamic, Kinematic, RigidBody, Static } from 'libs/tengine/physics/components';
import { Position2, Velocity2, Speed, Acceleration2, Rotation } from 'libs/tengine/core';
import { Ball, Enemy, Player, Wall, accelerateByArrows, changeVelocityByArrows } from './ecs';
import { applyWorldBoundaries } from 'libs/tengine/collision/penetration-resolution';
import {
  CollisionsMonitoring,
  applyPositionToCollider,
  checkNarrowCollisionSimple,
  ColliderSet,
} from 'libs/tengine/collision';
import {
  applyRigidBodyAccelerationToVelocity,
  applyRigidBodyVelocityToPosition,
  dynamicRigidBodyCollisionResolution,
} from 'libs/tengine/physics';
import { drawViews, View, drawDebugLines } from 'libs/tengine/render';
import { penetrationResolution } from 'libs/tengine/collision/penetration-resolution';

export async function initPongGame(parentElement: HTMLElement) {
  const game = newGame({
    canvas: {
      parentElement,
      resizeTo: window,
    },
  });

  await initGame(game, {
    backgroundColor: 0x000000,
  });

  const map = {
    container: new Container({
      label: 'map',
    }),
  };

  game.world.container.addChild(map.container);

  // # Initial Game Objects
  const characterSize = {
    width: 50,
    height: 100,
  };

  // # Player
  const playerEntity = spawnEntity(game.essence);

  // # Game Object
  setComponent(game.essence, playerEntity, Player);
  // # Position
  setComponent(game.essence, playerEntity, Position2, {
    x: game.world.size.width / 6 - characterSize.width / 2,
    y: game.world.size.height / 2 - characterSize.height / 2,
  });
  // # Acceleration based Movement
  setComponent(game.essence, playerEntity, Speed, { value: 1 });
  setComponent(game.essence, playerEntity, Acceleration2, {
    x: 0,
    y: 0,
  });
  setComponent(game.essence, playerEntity, Velocity2, {
    x: 0,
    y: 0,
  });
  // # Visuals
  setComponent(game.essence, playerEntity, View, {
    offset: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: Math.PI / 2,
    model: {
      type: 'graphics',
      color: 'blue',
      shape: {
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        type: 'rectangle',
        size: {
          width: characterSize.width,
          height: characterSize.height,
        },
      },
    },
  });
  // # Collisions
  // setComponent(game.essence, playerEntity, CollisionsMonitoring);
  // setComponent(game.essence, playerEntity, Impenetrable);
  setComponent(game.essence, playerEntity, ColliderSet, {
    list: [
      {
        type: 'solid',
        mass: 1,
        offset: { x: 0, y: 0 },
        position: { x: 0, y: 0 },
        shape: {
          type: 'constant_rectangle',
          width: characterSize.width,
          height: characterSize.height,
        },
      },
    ],
  });
  // # Physics
  setComponent(game.essence, playerEntity, RigidBody, {
    elasticity: 1,
    elasticityMode: 'average',
  });
  setComponent(game.essence, playerEntity, Kinematic);

  // # Enemy
  const enemyEntity = spawnEntity(game.essence);
  setComponent(game.essence, enemyEntity, Enemy);
  setComponent(game.essence, enemyEntity, View, {
    offset: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    model: {
      type: 'graphics',
      color: '0xff0000',
      shape: {
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        type: 'rectangle',
        size: {
          width: characterSize.width,
          height: characterSize.height,
        },
      },
    },
  });
  setComponent(game.essence, enemyEntity, Speed, { value: 1 });
  setComponent(game.essence, enemyEntity, Acceleration2, {
    x: 0,
    y: 0,
  });
  setComponent(game.essence, enemyEntity, Velocity2, {
    x: 0,
    y: 0,
  });
  setComponent(game.essence, enemyEntity, Position2, {
    x: (game.world.size.width / 6) * 5 - characterSize.width / 2,
    y: game.world.size.height / 2 - characterSize.height / 2,
  });
  // setComponent(game.essence, enemyEntity, Impenetrable);
  setComponent(game.essence, enemyEntity, ColliderSet, {
    list: [
      {
        type: 'solid',
        mass: 1,
        offset: { x: 0, y: 0 },
        position: { x: 0, y: 0 },
        shape: {
          type: 'constant_rectangle',
          width: characterSize.width,
          height: characterSize.height,
        },
      },
    ],
  });
  // # Physics
  setComponent(game.essence, enemyEntity, RigidBody, {
    elasticity: 1,
    elasticityMode: 'average',
  });
  setComponent(game.essence, enemyEntity, Kinematic);

  // # Ball
  const ballEntity = spawnEntity(game.essence);
  setComponent(game.essence, ballEntity, Ball);
  setComponent(game.essence, ballEntity, View, {
    offset: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    model: {
      type: 'graphics',
      color: '0xfff',
      shape: {
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        type: 'circle',
        radius: 25,
      },
    },
  });
  setComponent(game.essence, ballEntity, Speed, { value: 1 });
  setComponent(game.essence, ballEntity, Acceleration2, {
    x: 0,
    y: 0,
  });
  setComponent(game.essence, ballEntity, Velocity2, {
    x: 0,
    y: 0,
  });
  setComponent(game.essence, ballEntity, Position2, {
    x: game.world.size.width / 2 - 10,
    y: game.world.size.height / 2 - 10,
  });
  // # Collisions
  setComponent(game.essence, ballEntity, CollisionsMonitoring);
  // setComponent(game.essence, ballEntity, Impenetrable);
  setComponent(game.essence, ballEntity, ColliderSet, {
    list: [
      {
        type: 'solid',
        mass: 1,
        offset: { x: 0, y: 0 },
        position: { x: 0, y: 0 },
        shape: {
          type: 'circle',
          radius: 25,
        },
      },
    ],
  });
  // # Physics
  setComponent(game.essence, ballEntity, RigidBody, {
    elasticity: 1,
    elasticityMode: 'average',
  });
  setComponent(game.essence, ballEntity, Dynamic);

  // # Second Ball
  const sBallEntity = spawnEntity(game.essence);
  setComponent(game.essence, sBallEntity, Ball);
  // # View
  setComponent(game.essence, sBallEntity, View, {
    offset: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    model: {
      type: 'graphics',
      color: '0xfff',
      shape: {
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        type: 'circle',
        radius: 25,
      },
    },
  });
  setComponent(game.essence, sBallEntity, Speed, { value: 5 });
  setComponent(game.essence, sBallEntity, Velocity2, {
    x: 0,
    y: 0,
  });
  setComponent(game.essence, sBallEntity, Position2, {
    x: game.world.size.width / 2 + 100,
    y: game.world.size.height / 2 - 10,
  });
  // # Collisions
  // setComponent(game.essence, sBallEntity, CollisionsMonitoring);
  // setComponent(game.essence, sBallEntity, Impenetrable);
  setComponent(game.essence, sBallEntity, ColliderSet, {
    list: [
      {
        type: 'solid',
        mass: 1,
        offset: { x: 0, y: 0 },
        position: { x: 0, y: 0 },
        shape: {
          type: 'circle',
          radius: 25,
        },
      },
    ],
  });
  // # Physics
  setComponent(game.essence, sBallEntity, RigidBody, {
    elasticity: 1,
    elasticityMode: 'average',
  });
  setComponent(game.essence, sBallEntity, Dynamic);

  // # Wall
  const wallEntity = spawnEntity(game.essence);
  setComponent(game.essence, wallEntity, Wall);
  const wallStart = {
    x: 100,
    y: 100,
  };
  const wallEnd = {
    x: 0,
    y: 50,
  };
  // # View
  setComponent(game.essence, wallEntity, View, {
    offset: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    model: {
      type: 'graphics',
      color: '#fff',
      shape: {
        anchor: 0.5,
        type: 'line',
        length: 50,
      },
    },
  });
  // setComponent(game.essence, wallEntity, Rotation, { value: 0 });
  setComponent(game.essence, wallEntity, Speed, { value: 5 });
  setComponent(game.essence, wallEntity, Velocity2, {
    x: 0,
    y: 0,
  });
  setComponent(game.essence, wallEntity, Position2, wallStart);
  // # Collisions
  setComponent(game.essence, wallEntity, ColliderSet, {
    list: [
      {
        type: 'solid',
        mass: 1,
        offset: { x: 0, y: 0 },
        position: { x: 0, y: 0 },
        shape: {
          type: 'line',
          length: 50,
        },
      },
    ],
  });
  // # Physics
  setComponent(game.essence, wallEntity, RigidBody, {
    elasticity: 1,
    elasticityMode: 'average',
  });
  setComponent(game.essence, wallEntity, Dynamic);

  // # Capsule
  const capsuleEntity = spawnEntity(game.essence);
  setComponent(game.essence, capsuleEntity, Wall);
  // # View
  setComponent(game.essence, capsuleEntity, View, {
    offset: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    model: {
      type: 'graphics',
      color: '0xfff',
      shape: {
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        type: 'capsule',
        length: 100,
        radius: 25,
      },
    },
  });
  setComponent(game.essence, capsuleEntity, Position2, {
    x: 400,
    y: 200,
  });
  // setComponent(game.essence, capsuleEntity, Rotation, { value: Math.PI / 2 });
  setComponent(game.essence, capsuleEntity, Speed, { value: 1 });
  setComponent(game.essence, capsuleEntity, Acceleration2, {
    x: 0,
    y: 0,
  });
  setComponent(game.essence, capsuleEntity, Velocity2, {
    x: 0,
    y: 0,
  });
  setComponent(game.essence, capsuleEntity, RigidBody);

  // # Systems
  // ...
  // ## Input
  registerSystem(game.essence, mapKeyboardInput(game));
  registerSystem(game.essence, mapMouseInput(game, map));

  // ## Game logic
  // registerSystem(game.essence, accelerateByArrows(game, playerEntity));
  registerSystem(game.essence, accelerateByArrows(game, capsuleEntity));
  // registerSystem(game.essence, changeVelocityByArrows(game, ballEntity));

  // ## Basic physics
  registerSystem(game.essence, applyRigidBodyAccelerationToVelocity(game));
  registerSystem(game.essence, applyRigidBodyVelocityToPosition(game));
  registerSystem(game.essence, applyPositionToCollider(game));
  registerSystem(game.essence, applyWorldBoundaries(game));

  // ## Collision
  registerSystem(game.essence, checkNarrowCollisionSimple(game));
  registerSystem(game.essence, penetrationResolution(game));
  registerSystem(game.essence, dynamicRigidBodyCollisionResolution(game));

  // ## Render
  registerSystem(game.essence, drawViews(game, map));
  registerSystem(
    game.essence,
    drawDebugLines(game, map, {
      view: true,
      xy: true,
      collision: true,
    })
  );

  return game;
}

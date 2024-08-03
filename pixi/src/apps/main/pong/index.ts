import { Container } from 'pixi.js';
import { initGame, newGame } from '../../../libs/tengine/game';
import {
  archetypeByEntity,
  registerSystem,
  setComponent,
  spawnEntity,
  table,
  tryTable,
} from '../../../libs/tecs';
import { mapKeyboardInput, mapMouseInput } from '../../../libs/tengine/ecs';
import { Dynamic, Kinematic, RigidBody, Static } from 'libs/tengine/physics/components';
import {
  Position2,
  Velocity2,
  Speed,
  Acceleration2,
  Angle,
  Friction,
  DisableFriction,
} from 'libs/tengine/core';
import { Ball, Enemy, Player, accelerateByArrows } from './ecs';
import {
  CollisionsMonitoring,
  transformCollider,
  checkNarrowCollisionSimple,
  ColliderBody,
  rectangleColliderComponent,
  circleColliderComponent,
  verticesColliderComponent,
  lineColliderComponent,
  filterCollisionEvents,
} from 'libs/tengine/collision';
import {
  applyRigidBodyAccelerationToVelocity,
  applyRigidBodyFriction,
  applyRigidBodyVelocityToPosition,
  dynamicRigidBodyCollisionResolution,
} from 'libs/tengine/physics';
import { drawViews, drawDebugLines, addNewViews, DEBUG } from 'libs/tengine/render';
import { penetrationResolution } from 'libs/tengine/collision/penetration-resolution';
import { updatePrevious } from 'libs/tengine/core/update-previous';
import { awakening } from 'libs/tengine/collision/awakening';

export async function initPongGame(parentElement: HTMLElement) {
  DEBUG.isActive = true;

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
    height: 150,
  };

  // # World boundaries
  const boundariesOffset = 0;
  const boundaries = [
    {
      x: boundariesOffset,
      y: boundariesOffset,
      length: game.world.size.width,
      angle: -Math.PI / 2,
    },
    {
      x: game.world.size.width - boundariesOffset,
      y: boundariesOffset,
      length: game.world.size.height,
      angle: 0,
    },
    {
      x: game.world.size.width - boundariesOffset,
      y: game.world.size.height - boundariesOffset,
      length: game.world.size.width,
      angle: Math.PI / 2,
    },
    {
      x: boundariesOffset,
      y: game.world.size.height - boundariesOffset,
      length: game.world.size.height,
      angle: Math.PI,
    },
  ];

  for (const boundary of boundaries) {
    const boundaryEntity = spawnEntity(game.essence);

    setComponent(game.essence, boundaryEntity, Position2, {
      x: boundary.x,
      y: boundary.y,
      _prev: {
        x: boundary.x,
        y: boundary.y,
      },
    });
    // setComponent(game.essence, boundaryEntity, Velocity2, {
    //   max: 10,
    //   x: 0,
    //   y: 0,
    // });
    setComponent(game.essence, boundaryEntity, ColliderBody, {
      parts: [
        lineColliderComponent({
          parentPosition: boundary,
          parentAngle: 0,
          type: 'solid',
          mass: 1,
          offset: { x: 0, y: 0 },
          angle: boundary.angle,
          anchor: {
            x: 0,
            y: 0,
          },
          length: boundary.length,
          // size: { width: 10, height: boundary.length },
        }),
      ],
    });
    setComponent(game.essence, boundaryEntity, RigidBody, {
      elasticity: 1,
      elasticityMode: 'average',
    });
    setComponent(game.essence, boundaryEntity, Static);
  }

  // # Player
  const playerEntity = spawnEntity(game.essence);
  setComponent(game.essence, playerEntity, Player);
  // ## Position
  const playerPosition = {
    x: game.world.size.width / 6,
    y: game.world.size.height / 2,
    _prev: { x: 0, y: 0 },
  };
  setComponent(game.essence, playerEntity, Position2, playerPosition);
  // ## Angle
  const playerAngle = 0;
  setComponent(game.essence, playerEntity, Angle, { value: playerAngle, _prev: playerAngle });
  // ## Acceleration based Movement
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
  // # Collisions
  setComponent(game.essence, playerEntity, CollisionsMonitoring);
  setComponent(game.essence, playerEntity, ColliderBody, {
    parts: [
      rectangleColliderComponent({
        parentPosition: playerPosition,
        parentAngle: playerAngle,
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
  // # Physics
  setComponent(game.essence, playerEntity, RigidBody, {
    elasticity: 1,
    elasticityMode: 'average',
  });
  setComponent(game.essence, playerEntity, Kinematic);

  // # Enemy
  const enemyEntity = spawnEntity(game.essence);
  setComponent(game.essence, enemyEntity, Enemy);
  // ## Position
  const enemyPosition = {
    x: game.world.size.width - game.world.size.width / 6,
    y: game.world.size.height / 2,
    _prev: { x: 0, y: 0 },
  };
  setComponent(game.essence, enemyEntity, Position2, enemyPosition);
  // ## Angle
  const enemyAngle = 0;
  setComponent(game.essence, enemyEntity, Angle, { value: enemyAngle, _prev: 0 });
  // ## Acceleration based Movement
  setComponent(game.essence, enemyEntity, Speed, { value: 1 });
  setComponent(game.essence, enemyEntity, Acceleration2, {
    x: 0,
    y: 0,
  });
  setComponent(game.essence, enemyEntity, Friction, {
    value: 0,
  });
  setComponent(game.essence, enemyEntity, Velocity2, {
    max: 10,
    x: 0,
    y: 0,
  });
  // # Collisions
  setComponent(game.essence, enemyEntity, CollisionsMonitoring);
  setComponent(game.essence, enemyEntity, ColliderBody, {
    parts: [
      verticesColliderComponent({
        parentPosition: enemyPosition,
        parentAngle: enemyAngle,
        type: 'solid',
        mass: 1,
        offset: { x: 0, y: 0 },
        angle: 0,
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        vertices: [
          { x: 0, y: 0 },
          { x: characterSize.width, y: 0 },
          { x: characterSize.width, y: characterSize.height },
          { x: 0, y: characterSize.height },
        ],
      }),
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
  setComponent(game.essence, ballEntity, Speed, { value: 1 });
  setComponent(game.essence, ballEntity, Acceleration2, {
    x: 0,
    y: 0,
  });
  setComponent(game.essence, ballEntity, DisableFriction);
  setComponent(game.essence, ballEntity, Friction, {
    value: 0,
  });
  setComponent(game.essence, ballEntity, Velocity2, {
    max: 10,
    x: 0,
    y: 0,
  });
  const ballPosition = {
    x: game.world.size.width / 2 - 10,
    y: game.world.size.height / 2 - 10,
    _prev: { x: 0, y: 0 },
  };
  setComponent(game.essence, ballEntity, Position2, ballPosition);
  // # Collisions
  setComponent(game.essence, ballEntity, CollisionsMonitoring);
  setComponent(game.essence, ballEntity, ColliderBody, {
    parts: [
      circleColliderComponent({
        parentPosition: ballPosition,
        parentAngle: 0,
        type: 'solid',
        mass: 1,
        offset: { x: 0, y: 0 },
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        radius: 25,
      }),
    ],
  });
  // # Physics
  setComponent(game.essence, ballEntity, RigidBody, {
    elasticity: 1,
    elasticityMode: 'average',
  });
  setComponent(game.essence, ballEntity, Dynamic);

  // # Systems
  // ## Previous invalidation
  registerSystem(game.essence, updatePrevious(game));

  // ## Input
  registerSystem(game.essence, mapKeyboardInput(game));
  registerSystem(game.essence, mapMouseInput(game, map));

  // ## Game logic
  registerSystem(game.essence, accelerateByArrows(game, playerEntity));

  // ## Basic physics
  registerSystem(game.essence, applyRigidBodyAccelerationToVelocity(game));
  registerSystem(game.essence, applyRigidBodyFriction(game, 0.01));
  registerSystem(game.essence, applyRigidBodyVelocityToPosition(game));

  // ## Transform
  registerSystem(game.essence, transformCollider(game));

  // ## Collision
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
  registerSystem(
    game.essence,
    drawDebugLines(game, map, {
      view: true,
      xy: true,
      collision: true,
      velocity: true,
      acceleration: true,
    })
  );

  return game;
}

import { Container } from 'pixi.js';
import { initGame, newGame } from '../../../libs/tengine/game';
import { registerSystem, setComponent, spawnEntity, System } from '../../../libs/tecs';
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
import {
  Ball,
  Enemy,
  EnemyGoals,
  Goals,
  Player,
  PlayerGoals,
  accelerateByArrows,
  ballTunneling,
  ballPaddleCollided,
  checkCollisions,
  enemyAi,
  paddleWorldBoundaries,
  scoring,
  startGame,
} from './ecs';
import {
  CollisionsMonitoring,
  transformCollider,
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
import { drawViews, addNewViews, View } from 'libs/tengine/render';
import { penetrationResolution } from 'libs/tengine/collision/penetration-resolution';
import { updatePrevious } from 'libs/tengine/core/update-previous';
import { awakening } from 'libs/tengine/collision/awakening';
import { activateDebugMode } from 'libs/tengine/debug';
import { translateWithAnimation } from 'libs/tengine/animation';

export async function initPongGame(parentElement: HTMLElement) {
  const game = newGame({
    canvas: {
      parentElement,
      resizeTo: window,
    },
  });

  activateDebugMode(game, {
    render: {
      view: false,
      xy: false,
      collision: false,
      velocity: false,
      acceleration: false,
    },
  });

  await initGame(game, {
    backgroundColor: 0x000000,
  });

  const roundStarted = {
    value: false,
  };

  const map = {
    container: new Container({
      label: 'map',
    }),
  };

  game.world.container.addChild(map.container);

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
        }),
      ],
    });
    setComponent(game.essence, boundaryEntity, RigidBody, {
      elasticity: 1,
      elasticityMode: 'average',
    });
    setComponent(game.essence, boundaryEntity, Static);
  }

  // # Field
  const centerLine = spawnEntity(game.essence);
  setComponent(game.essence, centerLine, Position2, {
    x: game.world.size.width / 2,
    y: game.world.size.height / 2,
    _prev: {
      x: game.world.size.width / 2,
      y: game.world.size.height / 2,
    },
  });
  setComponent(game.essence, centerLine, View, {
    offset: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    anchor: { x: 0.5, y: 0.5 },
    alpha: 1,
    model: {
      type: 'graphics',
      shape: {
        type: 'rectangle',
        size: {
          width: 1,
          height: game.world.size.height / 2,
        },
      },
      color: '#333333',
    },
  });

  const centerLineCenter = spawnEntity(game.essence);
  const centerLineCenterRadius = 10;
  setComponent(game.essence, centerLineCenter, Position2, {
    x: game.world.size.width / 2,
    y: game.world.size.height / 2,
    _prev: {
      x: game.world.size.width / 2,
      y: game.world.size.height / 2,
    },
  });
  setComponent(game.essence, centerLineCenter, View, {
    offset: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    anchor: { x: 0.5, y: 0.5 },
    alpha: 1,
    model: {
      type: 'graphics',
      shape: {
        type: 'circle',
        radius: centerLineCenterRadius,
      },
      color: '#333333',
    },
  });

  const characterSize = {
    width: 50,
    height: 175,
  };

  // # Player
  const playerEntity = spawnEntity(game.essence);
  setComponent(game.essence, playerEntity, Player);
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
    x: game.world.size.width / 6,
    y: game.world.size.height / 2,
  };
  const playerPosition = {
    x: initialPlayerPosition.x,
    y: initialPlayerPosition.y,
    _prev: { x: initialPlayerPosition.x, y: initialPlayerPosition.y },
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
    elasticity: 0,
    elasticityMode: 'average',
  });
  setComponent(game.essence, playerEntity, Kinematic);

  // # Enemy
  const enemyEntity = spawnEntity(game.essence);
  setComponent(game.essence, enemyEntity, Enemy);
  // ## View
  setComponent(game.essence, enemyEntity, View, {
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
  const initialEnemyPosition = {
    x: game.world.size.width - game.world.size.width / 6,
    y: game.world.size.height / 2,
  };
  const enemyPosition = {
    x: initialEnemyPosition.x,
    y: initialEnemyPosition.y,
    _prev: {
      x: initialEnemyPosition.x,
      y: initialEnemyPosition.y,
    },
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
    value: 0.1,
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
    elasticity: 0,
    elasticityMode: 'average',
  });
  setComponent(game.essence, enemyEntity, Kinematic);

  // # Ball
  const ballEntity = spawnEntity(game.essence);
  setComponent(game.essence, ballEntity, Ball);
  // ## View
  setComponent(game.essence, ballEntity, View, {
    offset: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    anchor: { x: 0.5, y: 0.5 },
    alpha: 1,
    model: {
      type: 'graphics',
      shape: {
        type: 'circle',
        radius: 25,
      },
      color: '0xFFFFFF',
    },
  });
  setComponent(game.essence, ballEntity, Speed, { value: 2 });
  const ballAcceleration = {
    x: 0,
    y: 0,
  };
  setComponent(game.essence, ballEntity, Acceleration2, ballAcceleration);
  setComponent(game.essence, ballEntity, DisableFriction);
  setComponent(game.essence, ballEntity, Friction, {
    value: 0,
  });
  const ballVelocity = {
    max: 10,
    x: 0,
    y: 0,
  };
  setComponent(game.essence, ballEntity, Velocity2, ballVelocity);

  const initialBallPosition = {
    x: game.world.size.width / 2,
    y: game.world.size.height / 2,
  };
  const ballPosition = {
    x: initialBallPosition.x,
    y: initialBallPosition.y,
    _prev: {
      x: initialBallPosition.x,
      y: initialBallPosition.y,
    },
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

  // # Goals
  const goalsSize = { width: 50, height: game.world.size.height };

  // ## Player
  const playerGoals = spawnEntity(game.essence);
  setComponent(game.essence, playerGoals, Goals);
  setComponent(game.essence, playerGoals, PlayerGoals);
  setComponent(game.essence, playerGoals, View, {
    offset: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    anchor: { x: 0.5, y: 0.5 },
    alpha: 0.1,
    model: {
      type: 'graphics',
      shape: {
        type: 'rectangle',
        size: goalsSize,
      },
      color: '0xFFFFFF',
    },
  });
  const playerGoalsPosition = {
    x: goalsSize.width / 2,
    y: game.world.size.height / 2,
    _prev: { x: 0, y: 0 },
  };
  setComponent(game.essence, playerGoals, Position2, playerGoalsPosition);
  setComponent(game.essence, playerGoals, ColliderBody, {
    parts: [
      rectangleColliderComponent({
        parentPosition: playerGoalsPosition,
        parentAngle: 0,
        type: 'sensor',
        mass: 1,
        offset: { x: 0, y: 0 },
        angle: 0,
        size: goalsSize,
      }),
    ],
  });
  setComponent(game.essence, playerGoals, RigidBody);
  setComponent(game.essence, playerGoals, Static);

  const enemyGoals = spawnEntity(game.essence);
  setComponent(game.essence, enemyGoals, Goals);
  setComponent(game.essence, enemyGoals, EnemyGoals);
  setComponent(game.essence, enemyGoals, View, {
    offset: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    anchor: { x: 0.5, y: 0.5 },
    alpha: 0.1,
    model: {
      type: 'graphics',
      shape: {
        type: 'rectangle',
        size: goalsSize,
      },
      color: '0xFFFFFF',
    },
  });
  const enemyGoalsPosition = {
    x: game.world.size.width - goalsSize.width / 2,
    y: game.world.size.height / 2,
    _prev: { x: 0, y: 0 },
  };
  setComponent(game.essence, enemyGoals, Position2, enemyGoalsPosition);
  setComponent(game.essence, enemyGoals, ColliderBody, {
    parts: [
      rectangleColliderComponent({
        parentPosition: enemyGoalsPosition,
        parentAngle: 0,
        type: 'sensor',
        mass: 1,
        offset: { x: 0, y: 0 },
        angle: 0,
        size: { width: 20, height: game.world.size.height - 50 },
      }),
    ],
  });
  setComponent(game.essence, enemyGoals, RigidBody);
  setComponent(game.essence, enemyGoals, Static);

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
  // ### Start ball
  registerSystem(game.essence, startGame(ballVelocity, roundStarted), {
    stage: 'onFirstStep',
  });
  registerSystem(game.essence, ballPaddleCollided(game, playerEntity, enemyEntity, ballEntity));
  registerSystem(
    game.essence,
    scoring(
      game,
      playerEntity,
      enemyEntity,
      initialBallPosition,
      initialPlayerPosition,
      initialEnemyPosition,
      roundStarted
    )
  );
  // ### Movement
  registerSystem(game.essence, accelerateByArrows(game, playerEntity, roundStarted));
  // ### AI
  registerSystem(
    game.essence,
    enemyAi(game, enemyEntity, ballEntity, enemyGoals, characterSize, roundStarted)
  );
  // ### Paddle boundaries
  registerSystem(
    game.essence,
    paddleWorldBoundaries(game, playerEntity, enemyEntity, characterSize)
  );
  // ### Ball boundaries
  registerSystem(game.essence, ballTunneling(game, ballEntity));

  // ## Animations
  registerSystem(game.essence, translateWithAnimation(game));

  // ## Collision
  // ### Transform
  registerSystem(game.essence, transformCollider(game));

  // ### Calculate collisions
  registerSystem(game.essence, awakening(game));
  registerSystem(game.essence, checkCollisions(game, roundStarted));
  registerSystem(game.essence, filterCollisionEvents(game));

  // ## Physics
  registerSystem(game.essence, dynamicRigidBodyCollisionResolution(game));

  // ## Render
  const viewContainer = new Container();
  map.container.addChild(viewContainer);

  registerSystem(game.essence, addNewViews(game, viewContainer));
  registerSystem(game.essence, drawViews(game));

  return game;
}

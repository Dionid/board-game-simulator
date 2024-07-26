import { Container } from 'pixi.js';
import { initGame, newGame } from '../../../libs/tengine/game';
import { registerSystem, setComponent, spawnEntity } from '../../../libs/tecs';
import { mapKeyboardInput, mapMouseInput, drawViews } from '../../../libs/tengine/ecs';
import {
  Position2,
  Size2,
  View,
  Color,
  Velocity2,
  Speed,
  GraphicsTag,
  Pivot2,
  Acceleration2,
  Rectangle,
  Circle,
} from '../../../libs/tengine/core/components';
import {
  Ball,
  GameObject,
  Enemy,
  Player,
  applyGOWorldBoundaries,
  changeVelocityByArrows,
} from './ecs';
import { drawDebugLines } from '../../../libs/tengine/ecs/debug';
import {
  ActiveCollisions,
  checkNarrowCollisionSimple,
  ColliderSet,
} from '../../../libs/tengine/collision';
import {
  applyAccelerationToVelocity,
  applyVelocityToPosition,
  Kinematic,
  resolveCollision,
} from '../../../libs/tengine/physics';

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

  // create an engine

  // # Initial Game Objects
  const characterSize = {
    width: 50,
    height: 200,
  };

  // # Player
  const playerEntity = spawnEntity(game.essence);

  const playerPosition = {
    x: game.world.size.width / 6 - characterSize.width / 2,
    y: game.world.size.height / 2 - characterSize.height / 2,
  };

  // # Game Object
  setComponent(game.essence, playerEntity, GameObject);
  setComponent(game.essence, playerEntity, Player);
  // # Position
  setComponent(game.essence, playerEntity, Position2, playerPosition);
  setComponent(game.essence, playerEntity, Pivot2, { x: 0, y: 0 }); // ???
  // # Visuals
  setComponent(game.essence, playerEntity, View); // ???
  setComponent(game.essence, playerEntity, GraphicsTag);
  // ## Geometry
  setComponent(game.essence, playerEntity, Rectangle, {
    offset: { x: 0, y: 0 }, // ???
    size: { width: characterSize.width, height: characterSize.height },
  });
  setComponent(game.essence, playerEntity, Color, { value: 'blue' });
  // # Acceleration based Movement
  setComponent(game.essence, playerEntity, Speed, { value: 2 });
  setComponent(game.essence, playerEntity, Acceleration2, {
    x: 0,
    y: 0,
  });
  setComponent(game.essence, playerEntity, Velocity2, {
    x: 0,
    y: 0,
  });
  // # Collisions
  setComponent(game.essence, playerEntity, ColliderSet, {
    list: [
      {
        type: 'solid',
        offset: { x: 0, y: 0 },
        // size: { width: characterSize.width, height: characterSize.height },
        shape: {
          type: 'rectangle',
          width: characterSize.width,
          height: characterSize.height,
        },
      },
    ],
  });
  // # Physics
  setComponent(game.essence, playerEntity, Kinematic);

  // # Enemy
  const enemyEntity = spawnEntity(game.essence);
  setComponent(game.essence, enemyEntity, GameObject);
  setComponent(game.essence, enemyEntity, Enemy);
  setComponent(game.essence, enemyEntity, GraphicsTag);
  setComponent(game.essence, enemyEntity, View);
  setComponent(game.essence, enemyEntity, Rectangle, {
    offset: { x: 0, y: 0 },
    size: { width: characterSize.width, height: characterSize.height },
  });
  setComponent(game.essence, enemyEntity, Pivot2, { x: 0, y: 0 });
  setComponent(game.essence, enemyEntity, Speed, { value: 1 });
  setComponent(game.essence, enemyEntity, Acceleration2, {
    x: 0,
    y: 0,
  });
  setComponent(game.essence, enemyEntity, Velocity2, {
    x: 0,
    y: 0,
  });
  const enemyPosition = {
    x: (game.world.size.width / 6) * 5 - characterSize.width / 2,
    y: game.world.size.height / 2 - characterSize.height / 2,
  };
  setComponent(game.essence, enemyEntity, Position2, enemyPosition);
  setComponent(game.essence, enemyEntity, Color, { value: '0xff0000' });
  setComponent(game.essence, enemyEntity, Kinematic);
  setComponent(game.essence, enemyEntity, ColliderSet, {
    list: [
      {
        type: 'solid',
        offset: { x: 0, y: 0 },
        // size: { width: characterSize.width, height: characterSize.height },
        shape: {
          type: 'rectangle',
          width: characterSize.width,
          height: characterSize.height,
        },
      },
    ],
  });

  // # Ball
  const ballEntity = spawnEntity(game.essence);
  setComponent(game.essence, ballEntity, Ball);
  setComponent(game.essence, ballEntity, GameObject);
  setComponent(game.essence, ballEntity, View);
  setComponent(game.essence, ballEntity, GraphicsTag);
  setComponent(game.essence, ballEntity, Circle, {
    offset: { x: 0, y: 0 },
    radius: 25,
  });
  setComponent(game.essence, ballEntity, Pivot2, { x: 25, y: 25 }); // because pixi.circle has pivot in center
  setComponent(game.essence, ballEntity, Speed, { value: 10 });
  setComponent(game.essence, ballEntity, Velocity2, {
    x: 0,
    y: 0,
  });
  const ballPosition = {
    x: game.world.size.width / 2 - 10,
    y: game.world.size.height / 2 - 10,
  };
  setComponent(game.essence, ballEntity, Position2, ballPosition);
  setComponent(game.essence, ballEntity, Size2, { width: 50, height: 0 });
  setComponent(game.essence, ballEntity, Color, { value: '0xfff' });
  setComponent(game.essence, ballEntity, Kinematic);
  setComponent(game.essence, ballEntity, ActiveCollisions);
  setComponent(game.essence, ballEntity, ColliderSet, {
    list: [
      {
        type: 'solid',
        offset: { x: 0, y: 0 },
        shape: {
          type: 'circle',
          radius: 25,
        },
      },
    ],
  });

  // # Systems
  // # Collision
  registerSystem(game.essence, applyAccelerationToVelocity(game));
  registerSystem(game.essence, applyVelocityToPosition(game));
  registerSystem(game.essence, checkNarrowCollisionSimple(game));
  registerSystem(game.essence, resolveCollision(game));
  // registerSystem(game.essence, responseToCollision(game));
  // # Physics
  // ...
  // ## Input
  registerSystem(game.essence, mapKeyboardInput(game));
  registerSystem(game.essence, mapMouseInput(game, map));
  // ## Movement
  // registerSystem(game.essence, accelerateByArrows(game, playerEntity));
  registerSystem(game.essence, changeVelocityByArrows(game, ballEntity));
  registerSystem(game.essence, applyGOWorldBoundaries(game));
  // # Render
  registerSystem(game.essence, drawViews(game, map));
  registerSystem(
    game.essence,
    drawDebugLines(game, map, {
      graphics: false,
      xy: true,
      collision: false,
    })
  );

  return game;
}

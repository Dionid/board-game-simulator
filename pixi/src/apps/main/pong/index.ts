import { Container } from 'pixi.js';
import { initGame, newGame } from '../../../libs/tengine/game';
import { registerSystem, setComponent, spawnEntity } from '../../../libs/tecs';
import {
  mapKeyboardInput,
  mapMouseInput,
  Position,
  Size,
  View,
  Color,
  renderGameObjects,
  Velocity,
  Speed,
  pGraphicsTag,
  Shape,
  Pivot,
  Acceleration,
} from '../../../libs/tengine/ecs';
import { Ball, GameObject, Enemy, Player, moveByArrows, applyGOWorldBoundaries } from './ecs';
import { drawDebugLines } from '../../../libs/tengine/ecs/debug';
import {
  ActiveCollisions,
  checkNarrowCollisionSimple,
  ColliderSet,
} from '../../../libs/tengine/collision';
import {
  applyAccelerationToVelocity,
  applyVelocityToPosition,
  Dynamic,
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
  setComponent(game.essence, playerEntity, Player);
  setComponent(game.essence, playerEntity, GameObject);
  setComponent(game.essence, playerEntity, View);
  setComponent(game.essence, playerEntity, pGraphicsTag);
  setComponent(game.essence, playerEntity, Pivot, { x: 0, y: 0 });
  setComponent(game.essence, playerEntity, Shape, { name: 'rectangle' });
  setComponent(game.essence, playerEntity, Speed, { value: 2 });
  setComponent(game.essence, playerEntity, Acceleration, {
    x: 0,
    y: 0,
  });
  setComponent(game.essence, playerEntity, Velocity, {
    x: 0,
    y: 0,
  });
  const playerPosition = {
    x: game.world.size.width / 6 - characterSize.width / 2,
    y: game.world.size.height / 2 - characterSize.height / 2,
  };
  setComponent(game.essence, playerEntity, Position, playerPosition);
  setComponent(game.essence, playerEntity, Size, {
    width: characterSize.width,
    height: characterSize.height,
  });
  setComponent(game.essence, playerEntity, Color, { value: 'blue' });
  setComponent(game.essence, playerEntity, Kinematic);
  setComponent(game.essence, playerEntity, ColliderSet, {
    list: [
      {
        type: 'solid',
        shape: { name: 'rectangle' },
        position: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        center: { x: characterSize.width / 2, y: characterSize.height / 2 },
        size: { width: characterSize.width, height: characterSize.height },
        rotation: { value: 0 },
      },
    ],
  });

  // # Enemy
  const enemyEntity = spawnEntity(game.essence);
  setComponent(game.essence, enemyEntity, GameObject);
  setComponent(game.essence, enemyEntity, Enemy);
  setComponent(game.essence, enemyEntity, View);
  setComponent(game.essence, enemyEntity, pGraphicsTag);
  setComponent(game.essence, enemyEntity, Shape, { name: 'rectangle' });
  setComponent(game.essence, enemyEntity, Pivot, { x: 0, y: 0 });
  setComponent(game.essence, enemyEntity, Speed, { value: 1 });
  setComponent(game.essence, enemyEntity, Acceleration, {
    x: 0,
    y: 0,
  });
  setComponent(game.essence, enemyEntity, Velocity, {
    x: 0,
    y: 0,
  });
  const enemyPosition = {
    x: (game.world.size.width / 6) * 5 - characterSize.width / 2,
    y: game.world.size.height / 2 - characterSize.height / 2,
  };
  setComponent(game.essence, enemyEntity, Position, enemyPosition);
  setComponent(game.essence, enemyEntity, Size, {
    width: characterSize.width,
    height: characterSize.height,
  });
  setComponent(game.essence, enemyEntity, Color, { value: '0xff0000' });
  setComponent(game.essence, enemyEntity, Kinematic);
  setComponent(game.essence, enemyEntity, ColliderSet, {
    list: [
      {
        type: 'solid',
        shape: { name: 'rectangle' },
        position: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        center: { x: characterSize.width / 2, y: characterSize.height / 2 },
        size: { width: characterSize.width, height: characterSize.height },
        rotation: { value: 0 },
      },
    ],
  });

  // # Ball
  const ballEntity = spawnEntity(game.essence);
  setComponent(game.essence, ballEntity, Ball);
  setComponent(game.essence, ballEntity, GameObject);
  setComponent(game.essence, ballEntity, View);
  setComponent(game.essence, ballEntity, pGraphicsTag);
  setComponent(game.essence, ballEntity, Shape, { name: 'circle' });
  setComponent(game.essence, ballEntity, Pivot, { x: 25, y: 25 }); // because pixi.circle has pivot in center
  setComponent(game.essence, ballEntity, Velocity, {
    x: 10,
    y: 0,
  });
  const ballPosition = {
    x: game.world.size.width / 2 - 10,
    y: game.world.size.height / 2 - 10,
  };
  setComponent(game.essence, ballEntity, Position, ballPosition);
  setComponent(game.essence, ballEntity, Size, { width: 50, height: 0 });
  setComponent(game.essence, ballEntity, Color, { value: '0xfff' });
  setComponent(game.essence, ballEntity, Kinematic);
  setComponent(game.essence, ballEntity, ActiveCollisions);
  setComponent(game.essence, ballEntity, ColliderSet, {
    list: [
      {
        type: 'solid',
        shape: { name: 'circle' },
        position: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        center: { x: 0, y: 0 },
        size: { width: 50, height: 0 },
        rotation: { value: 0 },
      },
    ],
  });

  // // # Ball
  // const sBallEntity = spawnEntity(game.essence);
  // setComponent(game.essence, sBallEntity, Ball);
  // setComponent(game.essence, sBallEntity, GameObject);
  // setComponent(game.essence, sBallEntity, View);
  // setComponent(game.essence, sBallEntity, pGraphicsTag);
  // setComponent(game.essence, sBallEntity, Shape, { name: 'circle' });
  // setComponent(game.essence, sBallEntity, Pivot, { x: 25, y: 25 }); // because pixi.circle has pivot in center
  // setComponent(game.essence, sBallEntity, Velocity, {
  //   x: 0,
  //   y: 0,
  // });
  // const sBallPosition = {
  //   x: game.world.size.width / 2 + 150,
  //   y: game.world.size.height / 2 - 10,
  // };
  // setComponent(game.essence, sBallEntity, Position, sBallPosition);
  // setComponent(game.essence, sBallEntity, Size, { width: 50, height: 0 });
  // setComponent(game.essence, sBallEntity, Color, { value: '0xfff' });
  // setComponent(game.essence, sBallEntity, Kinematic);
  // // setComponent(game.essence, sBallEntity, ActiveCollisions);
  // setComponent(game.essence, sBallEntity, ColliderSet, {
  //   list: [
  //     {
  //       type: 'solid',
  //       shape: { name: 'circle' },
  //       position: { x: 0, y: 0 },
  //       offset: { x: 0, y: 0 },
  //       center: { x: 0, y: 0 },
  //       size: { width: 50, height: 0 },
  //       rotation: { value: 0 },
  //     },
  //   ],
  // });

  // // # Ball
  // const tBallEntity = spawnEntity(game.essence);
  // setComponent(game.essence, tBallEntity, Ball);
  // setComponent(game.essence, tBallEntity, GameObject);
  // setComponent(game.essence, tBallEntity, View);
  // setComponent(game.essence, tBallEntity, pGraphicsTag);
  // setComponent(game.essence, tBallEntity, Shape, { name: 'circle' });
  // setComponent(game.essence, tBallEntity, Pivot, { x: 25, y: 25 }); // because pixi.circle has pivot in center
  // setComponent(game.essence, tBallEntity, Velocity, {
  //   x: 0,
  //   y: 0,
  // });
  // const tBallPosition = {
  //   x: game.world.size.width / 2 - 170,
  //   y: game.world.size.height / 2 - 10,
  // };
  // setComponent(game.essence, tBallEntity, Position, tBallPosition);
  // setComponent(game.essence, tBallEntity, Size, { width: 50, height: 0 });
  // setComponent(game.essence, tBallEntity, Color, { value: '0xfff' });
  // setComponent(game.essence, tBallEntity, Kinematic);
  // // setComponent(game.essence, tBallEntity, ActiveCollisions);
  // setComponent(game.essence, tBallEntity, ColliderSet, {
  //   list: [
  //     {
  //       type: 'solid',
  //       shape: { name: 'circle' },
  //       position: { x: 0, y: 0 },
  //       offset: { x: 0, y: 0 },
  //       center: { x: 0, y: 0 },
  //       size: { width: 50, height: 0 },
  //       rotation: { value: 0 },
  //     },
  //   ],
  // });

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
  registerSystem(game.essence, moveByArrows(game, playerEntity));
  // registerSystem(game.essence, addVelocityToPosition(game));
  registerSystem(game.essence, applyGOWorldBoundaries(game));
  // # Render
  registerSystem(game.essence, renderGameObjects(game, map));
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

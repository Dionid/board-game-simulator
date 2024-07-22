import { Container, Graphics } from 'pixi.js';
import { initGame, newGame } from '../../../libs/tengine/game';
import { registerSystem, setComponent, spawnEntity } from '../../../libs/tecs';
import {
  mapKeyboardInput,
  mapMouseInput,
  pGraphics,
  Position,
  Size,
  View,
  Color,
  renderGameObjects,
  Velocity,
  Speed,
  pGraphicsTag,
  pGraphicsType,
  mBody,
} from '../../../libs/tengine/ecs';
import {
  addVelocityToPosition,
  applyCharactersWorldBoundaries,
  Ball,
  GameObject,
  Enemy,
  moveByArrows,
  Player,
} from './ecs';
import { Bodies, Body, Composite, Engine, Events } from 'matter-js';
import { syncPhysicsBodyPosition } from '../../../libs/tengine/ecs/physics';
import { drawDebugLines } from '../../../libs/tengine/ecs/debug';

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
  var engine = Engine.create({
    gravity: {
      x: 0,
      y: 0,
    },
  });

  engine.world.bounds = {
    min: {
      x: 0,
      y: 0,
    },
    max: {
      x: game.world.size.width,
      y: game.world.size.height,
    },
  };

  // Engine.update(engine, 16.666);

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
  setComponent(game.essence, playerEntity, pGraphicsType, { type: 'rect' });
  setComponent(game.essence, playerEntity, Speed, { value: 5 });
  setComponent(game.essence, playerEntity, Velocity, {
    x: 0,
    y: 0,
  });
  const playerPosition = {
    x: game.world.size.width / 6 - characterSize.width / 2,
    y: game.world.size.height / 2 - characterSize.height / 2,
  };
  setComponent(game.essence, playerEntity, Position, playerPosition);
  setComponent(game.essence, playerEntity, Size, { width: characterSize.width, height: characterSize.height });
  setComponent(game.essence, playerEntity, Color, { value: '0xfff' });
  const playerBody = Bodies.rectangle(playerPosition.x, playerPosition.y, characterSize.width, characterSize.height, {
    isStatic: true,
  });
  setComponent(game.essence, playerEntity, mBody, {
    value: playerBody,
  });

  // # Enemy
  const enemyEntity = spawnEntity(game.essence);
  setComponent(game.essence, enemyEntity, GameObject);
  setComponent(game.essence, enemyEntity, Enemy);
  setComponent(game.essence, enemyEntity, View);
  setComponent(game.essence, enemyEntity, pGraphicsTag);
  setComponent(game.essence, enemyEntity, pGraphicsType, { type: 'rect' });
  setComponent(game.essence, enemyEntity, Speed, { value: 5 });
  setComponent(game.essence, enemyEntity, Velocity, {
    x: 0,
    y: 0,
  });
  const enemyPosition = {
    x: (game.world.size.width / 6) * 5 - characterSize.width / 2,
    y: game.world.size.height / 2 - characterSize.height / 2,
  };
  setComponent(game.essence, enemyEntity, Position, enemyPosition);
  setComponent(game.essence, enemyEntity, Size, { width: characterSize.width, height: characterSize.height });
  setComponent(game.essence, enemyEntity, Color, { value: '0xff0000' });
  // # Matter.js body
  const enemyBody = Bodies.rectangle(enemyPosition.x, enemyPosition.y, characterSize.width, characterSize.height, {
    isStatic: true,
  });
  setComponent(game.essence, enemyEntity, mBody, {
    value: enemyBody,
  });

  // # Ball
  const ballEntity = spawnEntity(game.essence);
  setComponent(game.essence, ballEntity, Ball);
  setComponent(game.essence, ballEntity, GameObject);
  setComponent(game.essence, ballEntity, View);
  setComponent(game.essence, ballEntity, pGraphicsTag);
  setComponent(game.essence, ballEntity, pGraphicsType, { type: 'circle' });
  setComponent(game.essence, ballEntity, Speed, { value: 0.4 });
  setComponent(game.essence, ballEntity, Velocity, {
    x: 5,
    y: 0,
  });
  const ballPosition = {
    x: game.world.size.width / 2 - 10,
    y: game.world.size.height / 2 - 10,
  };
  setComponent(game.essence, ballEntity, Position, ballPosition);
  setComponent(game.essence, ballEntity, Size, { width: 50, height: 0 });
  setComponent(game.essence, ballEntity, Color, { value: '0xfff' });
  const ballBody = Bodies.circle(ballPosition.x, ballPosition.y, 25);
  setComponent(game.essence, ballEntity, mBody, {
    value: ballBody,
  });

  Composite.add(engine.world, [ballBody, playerBody, enemyBody]);

  // # Systems
  // ## Input
  registerSystem(game.essence, mapKeyboardInput(game));
  registerSystem(game.essence, mapMouseInput(game, map));
  // ## Movement
  registerSystem(game.essence, moveByArrows(game, playerEntity));
  registerSystem(game.essence, addVelocityToPosition(game));
  // registerSystem(game.essence, applyCharactersWorldBoundaries(game));
  registerSystem(game.essence, syncPhysicsBodyPosition(game));
  // # Render
  registerSystem(game.essence, renderGameObjects(game, map));
  // # Apply physics
  registerSystem(game.essence, ({ deltaMs }) => {
    Engine.update(engine, deltaMs);
  });
  registerSystem(
    game.essence,
    drawDebugLines(game, map, {
      xy: false,
      graphics: false,
    })
  );

  return game;
}

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
  setComponent(game.essence, playerEntity, Position, {
    x: game.world.size.width / 6 - characterSize.width / 2,
    y: game.world.size.height / 2 - characterSize.height / 2,
  });
  setComponent(game.essence, playerEntity, Size, { width: characterSize.width, height: characterSize.height });
  setComponent(game.essence, playerEntity, Color, { value: '0xfff' });

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
  setComponent(game.essence, enemyEntity, Position, {
    x: (game.world.size.width / 6) * 5 - characterSize.width / 2,
    y: game.world.size.height / 2 - characterSize.height / 2,
  });
  setComponent(game.essence, enemyEntity, Size, { width: characterSize.width, height: characterSize.height });
  setComponent(game.essence, enemyEntity, Color, { value: '0xff0000' });

  // # Ball
  const ballEntity = spawnEntity(game.essence);
  setComponent(game.essence, ballEntity, Ball);
  setComponent(game.essence, ballEntity, GameObject);
  setComponent(game.essence, ballEntity, View);
  setComponent(game.essence, ballEntity, pGraphicsTag);
  setComponent(game.essence, ballEntity, pGraphicsType, { type: 'circle' });
  setComponent(game.essence, ballEntity, Speed, { value: 5 });
  setComponent(game.essence, ballEntity, Velocity, {
    x: 0,
    y: 0,
  });
  setComponent(game.essence, ballEntity, Position, {
    x: game.world.size.width / 2 - 10,
    y: game.world.size.height / 2 - 10,
  });
  setComponent(game.essence, ballEntity, Size, { width: 50, height: 0 });
  setComponent(game.essence, ballEntity, Color, { value: '0xfff' });

  // # Systems
  // ## Input
  registerSystem(game.essence, mapKeyboardInput(game));
  registerSystem(game.essence, mapMouseInput(game, map));
  // ## Movement
  registerSystem(game.essence, moveByArrows(game, playerEntity));
  registerSystem(game.essence, addVelocityToPosition(game));
  registerSystem(game.essence, applyCharactersWorldBoundaries(game));
  // # GameObjects
  registerSystem(game.essence, renderGameObjects(game, map), 'postUpdate');

  return game;
}

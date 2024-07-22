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
} from '../../../libs/tengine/ecs';
import { addVelocityToPosition, applyCharactersWorldBoundaries, Character, moveByArrows, Player } from './ecs';

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

  const playerEntity = spawnEntity(game.essence);
  const playerG = new Graphics().rect(
    game.world.size.width / 6 - characterSize.width / 2,
    game.world.size.height / 2 - characterSize.height / 2,
    characterSize.width,
    characterSize.height
  );
  playerG.label = 'player';
  setComponent(game.essence, playerEntity, Player);
  setComponent(game.essence, playerEntity, Character);
  setComponent(game.essence, playerEntity, View);
  setComponent(game.essence, playerEntity, pGraphics, { value: playerG });
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

  // map.container.addChild(playerG);

  const enemy = new Graphics().rect(
    (game.world.size.width / 6) * 5 - characterSize.width / 2,
    game.world.size.height / 2 - characterSize.height / 2,
    characterSize.width,
    characterSize.height
  );
  enemy.label = 'enemy';
  enemy.fill(0xff0000);
  map.container.addChild(enemy);

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

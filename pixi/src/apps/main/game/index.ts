import { registerSystem } from '../../../libs/tecs';
import { Application, Assets, Container, Sprite, Spritesheet, Texture } from 'pixi.js';
import firstMapData from './assets/FirstMap.json';
import { newGame, Game } from '../../../libs/tengine/game';
import {
  applyCameraToWorld,
  mapMouseInput,
  moveCameraByDragging,
  zoom,
  moveCamera,
  applyWorldBoundariesToCamera,
} from '../../../libs/tengine/ecs';
import { initTileMap } from '../../../libs/tengine/tilemap';
import humanAtlasData from './assets/human_atlas.json';
import { newAnimatedSprites, newDirectionalAnimationFrames } from '../../../libs/tengine/animation';
import { cartesianTileRowCol, tileCartesianPosition } from '../../../libs/tengine/isometric';
import { render } from 'libs/tengine/render';

const fillSceneContainer = async (game: Game) => {
  const texture = (await Assets.load('assets/star.png')) as Texture;

  const starsContrainer = new Container();

  const scale = 1;
  const ltElement = new Sprite({
    texture: texture,
    x: 0 + (texture.width / 2) * scale,
    y: 0 + texture.height * 0.7 * scale,
    scale: scale,
    anchor: {
      x: 0.5,
      y: 0.5,
    },
  });
  starsContrainer.addChild(ltElement);

  const rtElement = new Sprite({
    texture: texture,
    x: game.world.size.width - (texture.width / 2) * scale,
    y: 0 + texture.height * 0.7 * scale,
    scale: scale,
    anchor: {
      x: 0.5,
      y: 0.5,
    },
  });
  starsContrainer.addChild(rtElement);

  const lbElement = new Sprite({
    texture: texture,
    x: 0 + (texture.width / 2) * scale,
    y: game.world.size.height - texture.height * 0.7 * scale,
    scale: scale,
    anchor: {
      x: 0.5,
      y: 0.5,
    },
  });
  starsContrainer.addChild(lbElement);

  const rbElement = new Sprite({
    texture: texture,
    x: game.world.size.width - (texture.width / 2) * scale,
    y: game.world.size.height - texture.height * 0.7 * scale,
    scale: scale,
    anchor: {
      x: 0.5,
      y: 0.5,
    },
  });
  starsContrainer.addChild(rbElement);

  const centerElement = new Sprite({
    texture: texture,
    x: game.world.size.width / 2 - texture.width / 2 + (texture.width / 2) * scale,
    y: game.world.size.height / 2 - texture.height * 0.3 + texture.height * 0.7 * scale,
    scale: scale,
    anchor: {
      x: 0.5,
      y: 0.5,
    },
  });
  starsContrainer.addChild(centerElement);

  // sort the trees by their y position
  starsContrainer.children.sort((a, b) => a.position.y - b.position.y);

  game.world.container.addChild(starsContrainer);
};

export const initWorld = async (app: Application) => {
  // # Game
  const game = newGame({
    app,
    camera: {
      // position: {
      //   x: 0,
      //   y: 0,
      // },
      scale: {
        x: 0.5,
        y: 0.5,
      },
      zoom: {
        min: 0.1,
        max: 2,
        step: 0.1,
      },
    },
    world: {
      size: {
        width: 5000,
        height: 3000,
      },
    },
  });

  // # Init map
  const map = await initTileMap({
    assetName: 'kennytilesheet',
    texture: 'assets/kennytilesheet.png',
    mapData: firstMapData,
    // layerTileDepthModifier: {
    //   Floor: 410,
    //   'Outer Walls': 400,
    //   'Inner Walls': 400,
    //   default: 460,
    // },
  });

  const { container: mapContainer, tileMap } = map;

  mapContainer.label = 'map';

  // # Move pivot to top left corner
  mapContainer.pivot.x = -mapContainer.width / 2 + tileMap.tileWidth / 2;
  mapContainer.pivot.y = -tileMap.spriteHeight + tileMap.tileHeight;
  // # Move map littlebit
  // mapContainer.x = 100;
  // mapContainer.y = 100;

  game.world.container.addChild(map.container);

  // # Center camera
  // setCameraPosition(
  //   worldScene.cameras.main,
  //   worldScene.size.width / 2 - worldScene.cameras.main.size.width / 2,
  //   worldScene.size.height / 2 - worldScene.cameras.main.size.height / 2
  // );

  // ## Fill with some data
  fillSceneContainer(game);

  // # Init player
  const playerContainer = new Container();
  playerContainer.label = 'player';
  playerContainer.pivot = {
    x: 0,
    y: 0,
  };

  mapContainer.addChild(playerContainer);

  playerContainer.position.set(100, 100);
  // const playerPositionCenter = {
  //   x: mapContainer.x,
  //   y: mapContainer.height / 2,
  // };
  // playerContainer.position.set(playerPositionCenter.x, playerPositionCenter.y);

  // Also can change to just load (https://codesandbox.io/p/sandbox/charming-wilbur-gm7vgl?file=%2Fsrc%2Findex.js%3A15%2C24-15%2C74&utm_medium=sandpack)
  const playerTexture = (await Assets.load(`assets/${humanAtlasData.meta.image}`)) as Texture;

  const directions = ['TR', 'R', 'BR', 'B', 'BL', 'L', 'TL', 'T'] as const;

  const playerSpritesheet = new Spritesheet(playerTexture, {
    ...humanAtlasData,
    animations: {
      ...newDirectionalAnimationFrames(directions, 'run', 'Human_', {
        start: 0,
        end: 9,
        prefix: '_Run',
        postfix: '.png',
      }),
      ...newDirectionalAnimationFrames(directions, 'pickup', 'Human_', {
        start: 0,
        end: 9,
        prefix: '_Pickup',
        postfix: '.png',
      }),
      ...newDirectionalAnimationFrames(directions, 'idle', 'Human_', {
        start: 0,
        end: 0,
        prefix: '_Idle',
        postfix: '.png',
      }),
    },
  });

  // Generate all the Textures asynchronously
  await playerSpritesheet.parse();

  const playerAnimationSprites = newAnimatedSprites(playerSpritesheet.animations, {
    x: 0.5,
    y: 0.9,
  });

  const currentAnimation = playerAnimationSprites.runB;

  currentAnimation.position.set(0, 0);
  currentAnimation.animationSpeed = 0.1666;
  currentAnimation.play();

  playerContainer.addChild(currentAnimation);

  playerContainer.pivot = {
    x: 0,
    y: 0,
  };

  app.canvas.addEventListener('click', (e) => {
    currentAnimation.gotoAndPlay(0);

    playerContainer.position.set(game.input.mouse.mapPosition.x, game.input.mouse.mapPosition.y);

    const { x, y } = playerContainer.position;
    const { tileWidth, tileHeight } = tileMap;
    const rc = cartesianTileRowCol(playerContainer.position, {
      width: tileWidth,
      height: tileHeight,
    });
    console.log({ x, y }, rc, tileCartesianPosition(rc, { width: tileWidth, height: tileHeight }));
  });

  // # Systems
  // ## Inputs
  registerSystem(game.essence, mapMouseInput(game, map));
  // # Camera
  registerSystem(game.essence, moveCameraByDragging(game));
  registerSystem(game.essence, zoom(game));
  registerSystem(game.essence, applyWorldBoundariesToCamera(game));
  registerSystem(game.essence, moveCamera(game));
  registerSystem(game.essence, applyCameraToWorld(game));
  // # Render
  registerSystem(game.essence, render(game));

  // const entity = spawnEntity(world);
  // const circle = new Graphics().circle(0, 0, 50);
  // setComponent(world, entity, View);
  // setComponent(world, entity, pGraphics, { value: circle });
  // setComponent(world, entity, Position, { x: 100, y: 100 });
  // setComponent(world, entity, Size, { width: 100, height: 100 });
  // setComponent(world, entity, Color, { value: 'red' });

  return game;
};

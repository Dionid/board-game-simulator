import { newWorld, registerSystem } from '../../../libs/tecs';
import {
  AnimatedSprite,
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
  Spritesheet,
  Texture,
  TilingSprite,
} from 'pixi.js';
import firstMapData from './assets/FirstMap.json';
import { createWorldScene, setCameraPosition, Vector2, WorldScene } from './engine';
import {
  applyCameraToContainer,
  render,
  mapMouseInput,
  moveCameraByDragging,
  zoom,
  moveCamera,
  applyWorldBoundariesToCamera,
} from './ecs';
import { initTileMap } from './engine/tilemap';
import humanAtlasData from './assets/human_atlas.json';
import { newAnimatedSprites, newDirectionalAnimationFrames } from './engine/animation';
import { cartesianToIso } from './engine/isometric';

const fillSceneContainer = async (worldScene: WorldScene) => {
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
    x: worldScene.size.width - (texture.width / 2) * scale,
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
    y: worldScene.size.height - texture.height * 0.7 * scale,
    scale: scale,
    anchor: {
      x: 0.5,
      y: 0.5,
    },
  });
  starsContrainer.addChild(lbElement);

  const rbElement = new Sprite({
    texture: texture,
    x: worldScene.size.width - (texture.width / 2) * scale,
    y: worldScene.size.height - texture.height * 0.7 * scale,
    scale: scale,
    anchor: {
      x: 0.5,
      y: 0.5,
    },
  });
  starsContrainer.addChild(rbElement);

  const centerElement = new Sprite({
    texture: texture,
    x: worldScene.size.width / 2 - texture.width / 2 + (texture.width / 2) * scale,
    y: worldScene.size.height / 2 - texture.height * 0.3 + texture.height * 0.7 * scale,
    scale: scale,
    anchor: {
      x: 0.5,
      y: 0.5,
    },
  });
  starsContrainer.addChild(centerElement);

  // sort the trees by their y position
  starsContrainer.children.sort((a, b) => a.position.y - b.position.y);

  worldScene.container.addChild(starsContrainer);
};

export const initWorld = async (app: Application) => {
  const essence = newWorld();

  // # Init map
  const map = await initTileMap({
    assetName: 'kennytilesheet',
    texture: 'assets/kennytilesheet.png',
    mapData: firstMapData,
    layerTileDepthModifier: {
      Floor: 410,
      'Outer Walls': 400,
      'Inner Walls': 400,
      default: 460,
    },
  });

  const { container: mapContainer, tileMap } = map;

  mapContainer.label = 'map';

  // # Move pivot to top left corner
  mapContainer.pivot.x = -mapContainer.width / 2 + tileMap.tileWidth / 2;
  mapContainer.pivot.y = -tileMap.spriteHeight + tileMap.tileHeight;
  // # Move map littlebit
  mapContainer.x = 100;
  mapContainer.y = 100;

  // # Main Scene Container
  const worldScene = createWorldScene(app, map, {
    camera: {
      position: {
        x: 0,
        y: 0,
      },
      scale: 1,
      size: {
        width: app.renderer.width,
        height: app.renderer.height,
      },
    },
    worldScene: {
      size: {
        x: 5000,
        y: 3000,
      },
    },
  });

  // # Add to stage
  app.stage.addChild(worldScene.container);

  // # Center camera
  // setCameraPosition(
  //   worldScene.cameras.main,
  //   worldScene.size.width / 2 - worldScene.cameras.main.size.width / 2,
  //   worldScene.size.height / 2 - worldScene.cameras.main.size.height / 2
  // );

  // ## Fill with some data
  fillSceneContainer(worldScene);

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

  const playerAnimationSprites = newAnimatedSprites(playerSpritesheet.animations, { x: 0.5, y: 0.9 });

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

    playerContainer.position.set(worldScene.input.mouse.mapPosition.x, worldScene.input.mouse.mapPosition.y);

    const { x, y } = playerContainer.position;
    const { tileWidth, tileHeight } = tileMap;

    function tilePosition(row: number, col: number) {
      return {
        x: (row * tileWidth) / 2 - (col * tileWidth) / 2,
        y: (row * tileHeight) / 2 + (col * tileHeight) / 2,
      };
    }

    function tileRowCol(x: number, y: number) {
      return {
        col: Math.floor(x / tileWidth + y / tileHeight - 0.5),
        row: Math.floor(y / tileHeight - x / tileWidth + 0.5),
      };
    }

    console.log(
      {
        x,
        y,
      },
      tileRowCol(x, y)
    );
  });

  // # Systems
  // ## Inputs
  registerSystem(essence, mapMouseInput(worldScene, mapContainer));
  // # Camera
  registerSystem(essence, moveCameraByDragging(worldScene));
  registerSystem(essence, zoom(worldScene));
  registerSystem(essence, applyWorldBoundariesToCamera(worldScene));
  registerSystem(essence, moveCamera(worldScene));
  registerSystem(essence, applyCameraToContainer(worldScene));
  // # Render
  registerSystem(essence, render(essence, app), 'postUpdate');

  // const entity = spawnEntity(world);
  // const circle = new Graphics().circle(0, 0, 50);
  // setComponent(world, entity, View);
  // setComponent(world, entity, pGraphics, { value: circle });
  // setComponent(world, entity, Position, { x: 100, y: 100 });
  // setComponent(world, entity, Size, { width: 100, height: 100 });
  // setComponent(world, entity, Color, { value: 'red' });

  return essence;
};

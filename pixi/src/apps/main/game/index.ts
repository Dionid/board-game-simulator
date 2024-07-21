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
import { createWorldScene, setCameraPosition, WorldScene } from './engine';
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

const fillSceneContainer = async (worldScene: WorldScene) => {
  const texture = (await Assets.load('assets/star.png')) as Texture;

  // # Multiple elements
  // for (let i = 0; i < 1000; i++) {
  //   const scale = 1;
  //   const element = new Sprite({
  //     texture: texture,
  //     x: Math.random() * sceneSizeX + (texture.width / 2) * scale,
  //     y: Math.random() * sceneSizeY + (texture.height * 0.3) * scale,
  //     scale: scale,
  //     anchor: {
  //   x: 0.5,
  // y: 0.5,},
  //   });

  //   sceneContainer.addChild(element);
  // }

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
  const world = newWorld();

  // # Main Scene Container
  const worldScene = createWorldScene(app, {
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
        x: 1760,
        y: 1000,
      },
    },
  });

  // # Add to stage
  app.stage.addChild(worldScene.container);

  // # Center camera
  setCameraPosition(
    worldScene.cameras.main,
    worldScene.size.width / 2 - worldScene.cameras.main.size.width / 2,
    worldScene.size.height / 2 - worldScene.cameras.main.size.height / 2
  );

  // ## Fill with some data
  fillSceneContainer(worldScene);

  // # Init map
  const mapContainer = await initTileMap();
  mapContainer.x = mapContainer.width / 2 + mapContainer.width / 6;
  worldScene.container.addChild(mapContainer);

  // # Init player
  const playerContainer = new Container();

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

  const playerAnimationSprites = newAnimatedSprites(playerSpritesheet, { x: 0.5, y: 1 });

  playerAnimationSprites.runB.animationSpeed = 0.1666;
  playerAnimationSprites.runB.play();
  playerAnimationSprites.runB.position.set(0, mapContainer.height / 2 / mapContainer.scale.y);

  playerContainer.addChild(playerAnimationSprites.runB);

  mapContainer.addChild(playerContainer);

  // # Systems
  // ## Inputs
  registerSystem(world, mapMouseInput(worldScene));
  // # Camera
  registerSystem(world, moveCameraByDragging(worldScene));
  registerSystem(world, zoom(worldScene));
  registerSystem(world, applyWorldBoundariesToCamera(worldScene));
  registerSystem(world, moveCamera(worldScene));
  registerSystem(world, applyCameraToContainer(worldScene));
  // # Render
  registerSystem(world, render(world, app), 'postUpdate');

  // const entity = spawnEntity(world);
  // const circle = new Graphics().circle(0, 0, 50);
  // setComponent(world, entity, View);
  // setComponent(world, entity, pGraphics, { value: circle });
  // setComponent(world, entity, Position, { x: 100, y: 100 });
  // setComponent(world, entity, Size, { width: 100, height: 100 });
  // setComponent(world, entity, Color, { value: 'red' });

  return world;
};

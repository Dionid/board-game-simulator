import { newWorld, registerSystem } from '../../../libs/tecs';
import { Application, Assets, Sprite, Texture } from 'pixi.js';
import { createWorldScene, moveCameraByDragging, WorldScene } from './engine';
import { ApplyCameraToScene, Draw } from './ecs';

const fillSceneContainer = async (worldScene: WorldScene) => {
  const texture = (await Assets.load('assets/star.png')) as Texture;

  // # Multiple elements
  // for (let i = 0; i < 1000; i++) {
  //   const scale = 1;
  //   const element = new Sprite({
  //     texture: texture,
  //     x: Math.random() * sceneSizeX + (texture.width / 2) * scale,
  //     y: Math.random() * sceneSizeY + (texture.height / 2) * scale,
  //     scale: scale,
  //     anchor: 0.5,
  //   });

  //   sceneContainer.addChild(element);
  // }

  const scale = 1;
  const ltElement = new Sprite({
    texture: texture,
    x: 0 + (texture.width / 2) * scale,
    y: 0 + (texture.height / 2) * scale,
    scale: scale,
    anchor: 0.5,
  });
  worldScene.container.addChild(ltElement);

  const rtElement = new Sprite({
    texture: texture,
    x: worldScene.size.x - (texture.width / 2) * scale,
    y: 0 + (texture.height / 2) * scale,
    scale: scale,
    anchor: 0.5,
  });
  worldScene.container.addChild(rtElement);

  const lbElement = new Sprite({
    texture: texture,
    x: 0 + (texture.width / 2) * scale,
    y: worldScene.size.y - (texture.height / 2) * scale,
    scale: scale,
    anchor: 0.5,
  });
  worldScene.container.addChild(lbElement);

  const rbElement = new Sprite({
    texture: texture,
    x: worldScene.size.x - (texture.width / 2) * scale,
    y: worldScene.size.y - (texture.height / 2) * scale,
    scale: scale,
    anchor: 0.5,
  });
  worldScene.container.addChild(rbElement);

  const centerElement = new Sprite({
    texture: texture,
    x: worldScene.size.x / 2 - texture.width / 2 + (texture.width / 2) * scale,
    y: worldScene.size.y / 2 - texture.height / 2 + (texture.height / 2) * scale,
    scale: scale,
    anchor: 0.5,
  });
  worldScene.container.addChild(centerElement);

  // sort the trees by their y position
  worldScene.container.children.sort((a, b) => a.position.y - b.position.y);
};

export const initWorld = async (app: Application) => {
  const world = newWorld();

  // # Main Scene Container
  // ## Initial props
  const sceneSizeX = 2000;
  const sceneSizeY = 1000;

  const worldScene = createWorldScene(app, {
    camera: {
      position: {
        x: 0,
        y: 0,
      },
      width: app.renderer.width,
      height: app.renderer.height,
      boundLX: 0,
      boundLY: 0,
      boundRX: sceneSizeX - app.renderer.width,
      boundRY: sceneSizeY - app.renderer.height,
    },
    worldScene: {
      size: {
        x: 2000,
        y: 1000,
      },
      boundLX: 0,
      boundTY: 0,
    },
  });

  const camera = worldScene.cameras.main;

  // # Add to stage
  app.stage.addChild(worldScene.container);

  // ## Set camera to center
  camera.position.x = worldScene.size.x / 2 - camera.width / 2;
  camera.position.y = worldScene.size.y / 2 - camera.height / 2;

  // # Camera movement
  moveCameraByDragging(worldScene);

  // ## Fill with some data
  fillSceneContainer(worldScene);

  // # Systems
  registerSystem(world, ApplyCameraToScene(worldScene));
  registerSystem(world, Draw(world, app), 'postUpdate');

  // const entity = spawnEntity(world);
  // const circle = new Graphics().circle(0, 0, 50);
  // setComponent(world, entity, View);
  // setComponent(world, entity, pGraphics, { value: circle });
  // setComponent(world, entity, Position, { x: 100, y: 100 });
  // setComponent(world, entity, Size, { width: 100, height: 100 });
  // setComponent(world, entity, Color, { value: 'red' });

  return world;
};

import { newWorld, registerSystem } from '../../../libs/tecs';
import { Application, Assets, Sprite, Texture } from 'pixi.js';
import { createWorldScene, moveCameraByDragging, setCameraPosition, WorldScene } from './engine';
import { ApplyCameraToContainer, Draw, MoveCameraByDragging, Zoom } from './ecs';

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
  worldScene.container.addChild(ltElement);

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
  worldScene.container.addChild(rtElement);

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
  worldScene.container.addChild(lbElement);

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
  worldScene.container.addChild(rbElement);

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
        y: 0.5,
      },
      scale: 1,
      width: app.renderer.width,
      height: app.renderer.height,
      boundLX: 0,
      boundLY: 0.5,
      boundRX: sceneSizeX - app.renderer.width,
      boundRY: sceneSizeY - app.renderer.height,
    },
    worldScene: {
      size: {
        x: 2000,
        y: 1000,
      },
      boundLX: 0,
      boundTY: 0.5,
    },
  });

  (globalThis as any).__TECS_WORLD_SCENE__ = worldScene;

  const camera = worldScene.cameras.main;

  // # Add to stage
  app.stage.addChild(worldScene.container);

  setCameraPosition(
    camera,
    worldScene.size.width / 2 - camera.width / 2,
    worldScene.size.height / 2 - camera.height / 2
  );

  // # Camera movement
  moveCameraByDragging(worldScene);

  // ## Fill with some data
  fillSceneContainer(worldScene);

  // # Mouse move
  app.canvas.addEventListener('mousemove', (e) => {
    worldScene.input.mouse.previous.clientPosition.x = worldScene.input.mouse.clientPosition.x;
    worldScene.input.mouse.previous.clientPosition.y = worldScene.input.mouse.clientPosition.y;
    worldScene.input.mouse.previous.scenePosition.x = worldScene.input.mouse.scenePosition.x;
    worldScene.input.mouse.previous.scenePosition.y = worldScene.input.mouse.scenePosition.y;

    worldScene.input.mouse.clientPosition.x = e.x;
    worldScene.input.mouse.clientPosition.y = e.y;

    worldScene.input.mouse.scenePosition.x = Math.floor(
      e.x / worldScene.cameras.main.scale + worldScene.cameras.main.scaledPosition.x
    );
    worldScene.input.mouse.scenePosition.y = Math.floor(
      e.y / worldScene.cameras.main.scale + worldScene.cameras.main.scaledPosition.y
    );
  });

  // # Systems
  registerSystem(world, MoveCameraByDragging(worldScene));
  registerSystem(world, ApplyCameraToContainer(worldScene));
  registerSystem(world, Zoom(worldScene), 'postUpdate');
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

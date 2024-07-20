import { newWorld, registerSystem } from '../../../libs/tecs';
import { Application, Assets, Sprite, Texture } from 'pixi.js';
import { createWorldScene, setCameraPosition, WorldScene } from './engine';
import { applyCameraToContainer, render, mapMouseInput, moveCameraByDragging, zoom } from './ecs';

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
    },
  });

  // # Add to stage
  app.stage.addChild(worldScene.container);

  // # Center camera
  setCameraPosition(
    worldScene.cameras.main,
    worldScene.size.width / 2 - worldScene.cameras.main.width / 2,
    worldScene.size.height / 2 - worldScene.cameras.main.height / 2
  );

  // ## Fill with some data
  fillSceneContainer(worldScene);

  // # Systems
  // ## Inputs
  registerSystem(world, mapMouseInput(worldScene));
  // # Camera
  registerSystem(world, moveCameraByDragging(worldScene));
  registerSystem(world, zoom(worldScene));
  // # Apply camera
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

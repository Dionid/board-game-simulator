import { newWorld, registerSystem } from '../../../libs/tecs';
import { Application, Assets, Sprite, Texture } from 'pixi.js';
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
        x: 2000,
        y: 1000,
      },
    },
  });

  const camera = worldScene.cameras.main;

  // ## On resize change camera last coordinates
  app.canvas.addEventListener('resize', () => {
    camera.size.width = app.renderer.width;
    camera.size.height = app.renderer.width;

    // TODO: Maybe move
    // if (camera.position.x > worldScene.size.width - camera.width) {
    //   camera.position.x = worldScene.size.width - camera.width;
    // }

    // if (camera.position.y > worldScene.size.height - camera.height) {
    //   camera.position.y = worldScene.size.height - camera.height;
    // }
  });

  // # Add to stage
  app.stage.addChild(worldScene.container);

  // # Center camera
  setCameraPosition(
    camera,
    worldScene.size.width / 2 - camera.size.width / 2,
    worldScene.size.height / 2 - camera.size.height / 2
  );

  // ## Fill with some data
  fillSceneContainer(worldScene);

  // # Systems
  // ## Inputs
  registerSystem(world, mapMouseInput(worldScene));
  // # Camera
  registerSystem(world, moveCameraByDragging(worldScene));
  registerSystem(world, zoom(worldScene));
  registerSystem(world, applyWorldBoundariesToCamera(worldScene));
  registerSystem(world, moveCamera(worldScene));
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

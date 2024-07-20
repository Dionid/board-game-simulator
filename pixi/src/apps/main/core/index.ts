import {
  $defaultFn,
  $kind,
  newSchema,
  newWorld,
  number,
  string,
  System,
  table,
  registerSystem,
  spawnEntity,
  setComponent,
  World,
  registerQuery,
  Topic,
  newTopic,
  registerTopic,
  newTag,
  Entity,
} from '../../../libs/tecs';
import { hasSchema, tryTable } from '../../../libs/tecs/archetype';
import { Query } from '../../../libs/tecs/query';
import { Application, Assets, Container, Graphics, Sprite, Texture } from 'pixi.js';
import { Camera, WorldScene } from './engine';

// # Schemas

export const View = newTag();

export const $graphics = Symbol('graphics');

export const graphics = {
  [$kind]: $graphics,
  byteLength: 8,
  [$defaultFn]: () => new Graphics(),
} as const;

export const pGraphics = newSchema({
  value: graphics,
});

export const Position = newSchema({
  x: number,
  y: number,
});

export const Size = newSchema({
  width: number,
  height: number,
});

export const Color = newSchema({
  value: string,
});

// # Topics
const clicked = newTopic<{ type: 'clicked'; position: { x: number; y: number } }>();
const viewEvents = newTopic<{ type: 'pointerOver'; entity: Entity }>();

// # Queries

const drawQuery = Query.new(View, Position);

// # Systems

export const ViewEvents = (app: Application): System => {
  return ({ world, deltaFrameTime }) => {
    for (const event of viewEvents) {
      setComponent(world, event.entity, Color, { value: 'blue' });
    }
  };
};

export const Clicked = (app: Application): System => {
  return ({ world, deltaFrameTime }) => {
    for (const event of clicked) {
    }
  };
};

export const ApplyCameraToScene = (camera: Camera, worldScene: WorldScene): System => {
  return () => {
    // # Apply camera to scene
    worldScene.container.x = -camera.x;
    worldScene.container.y = -camera.y;

    if (worldScene.container.x > worldScene.boundLX) {
      worldScene.container.x = worldScene.boundLX;
    } else if (worldScene.container.x < -camera.boundRX) {
      worldScene.container.x = -camera.boundRX;
    } else if (worldScene.container.y > worldScene.boundTY) {
      worldScene.container.y = worldScene.boundTY;
    }

    if (worldScene.container.y < -camera.boundRY) {
      worldScene.container.y = -camera.boundRY;
    } else if (worldScene.container.y > worldScene.boundTY) {
      worldScene.container.y = worldScene.boundTY;
    } else if (worldScene.container.y < -camera.boundRY) {
      worldScene.container.y = -camera.boundRY;
    }
  };
};

export const Draw = (world: World, app: Application): System => {
  const query = registerQuery(world, drawQuery);

  return ({ world, deltaFrameTime }) => {
    for (const archetype of query.archetypes) {
      const positionT = table(archetype, Position);
      const graphicsT = tryTable(archetype, pGraphics);
      const colorT = tryTable(archetype, Color);

      for (let i = 0, l = archetype.entities.length; i < l; i++) {
        if (graphicsT) {
          const graphics = graphicsT[i].value;

          graphics.clear();
          graphics.circle(positionT[i].x, positionT[i].y, 50);

          if (colorT) {
            graphics.fill(colorT[i].value);
          }

          if (graphics.parent === null) {
            app.stage.addChild(graphics);
          }
        }
      }
    }

    app.render();
  };
};

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
  const sceneBoundLX = 0;
  const sceneBoundTY = 0;
  // const sceneBoundRX = -sceneSizeX;
  // const sceneBoundBY = -sceneSizeY;

  // ## Container
  const sceneContainer = new Container({
    isRenderGroup: true,
  });

  // # Camera
  const camera = {
    x: 0,
    y: 0,
    width: app.renderer.width,
    height: app.renderer.height,
    boundLX: 0,
    boundLY: 0,
    boundRX: sceneSizeX - app.renderer.width,
    boundRY: sceneSizeY - app.renderer.height,
  };

  const worldScene: WorldScene = {
    container: sceneContainer,
    size: {
      x: sceneSizeX,
      y: sceneSizeY,
    },
    cameras: {
      main: camera,
    },
    boundLX: sceneBoundLX,
    boundTY: sceneBoundTY,
  };

  // # Add to stage
  app.stage.addChild(sceneContainer);

  // ## Fill with some data
  fillSceneContainer(worldScene);

  // ## On resize change camera last coordinates
  app.canvas.addEventListener('resize', () => {
    camera.width = app.renderer.width;
    camera.height = app.renderer.width;
    camera.boundRX = worldScene.size.x - camera.width;
    camera.boundRY = worldScene.size.y - camera.height;

    if (camera.x > camera.boundRX) {
      camera.x = camera.boundRX;
    }
    if (camera.y > camera.boundRY) {
      camera.y = camera.boundRY;
    }
  });

  // ## Set camera to center
  camera.x = worldScene.size.x / 2 - camera.width / 2;
  camera.y = worldScene.size.y / 2 - camera.height / 2;

  // # Move by mouse
  let mouseDown = false;

  app.canvas.addEventListener('mousedown', (e) => {
    mouseDown = true;
  });

  app.canvas.addEventListener('mouseup', (e) => {
    mouseDown = false;
  });

  app.canvas.addEventListener('mousemove', (e) => {
    // # Calculate new camera
    if (mouseDown) {
      const newCameraX = camera.x - e.movementX;
      const newCameraY = camera.y - e.movementY;

      if (camera.x < camera.boundLX) {
        camera.x = camera.boundLX;
      } else if (camera.x > camera.boundRX) {
        camera.x = camera.boundRX;
      } else {
        camera.x = newCameraX;
      }

      if (camera.y < camera.boundLY) {
        camera.y = camera.boundLY;
      } else if (camera.y > camera.boundRY) {
        camera.y = camera.boundRY;
      } else {
        camera.y = newCameraY;
      }
    }
  });

  // # Topics
  registerTopic(world, clicked);
  registerTopic(world, viewEvents);

  window.addEventListener('click', (e) => {
    Topic.emit(clicked, { type: 'clicked', position: { x: e.clientX, y: e.clientY } });
  });

  // # Systems
  // registerSystem(world, Gravity(world));
  // registerSystem(world, SetPosition(world));
  registerSystem(world, Draw(world, app));
  registerSystem(world, Clicked(app));
  registerSystem(world, ViewEvents(app));
  registerSystem(world, ApplyCameraToScene(camera, worldScene));

  // const entity = spawnEntity(world);
  // const circle = new Graphics().circle(0, 0, 50);
  // setComponent(world, entity, View);
  // setComponent(world, entity, pGraphics, { value: circle });
  // setComponent(world, entity, Position, { x: 100, y: 100 });
  // setComponent(world, entity, Size, { width: 100, height: 100 });
  // setComponent(world, entity, Color, { value: 'red' });

  return world;
};

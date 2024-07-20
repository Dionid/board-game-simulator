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

const fillSceneContainer = async (sceneSizeX: number, sceneSizeY: number, sceneContainer: Container) => {
  const texture = (await Assets.load('assets/star.png')) as Texture;

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
  sceneContainer.addChild(ltElement);

  const rtElement = new Sprite({
    texture: texture,
    x: sceneSizeX - (texture.width / 2) * scale,
    y: 0 + (texture.height / 2) * scale,
    scale: scale,
    anchor: 0.5,
  });
  sceneContainer.addChild(rtElement);

  const lbElement = new Sprite({
    texture: texture,
    x: 0 + (texture.width / 2) * scale,
    y: sceneSizeY - (texture.height / 2) * scale,
    scale: scale,
    anchor: 0.5,
  });
  sceneContainer.addChild(lbElement);

  const rbElement = new Sprite({
    texture: texture,
    x: sceneSizeX - (texture.width / 2) * scale,
    y: sceneSizeY - (texture.height / 2) * scale,
    scale: scale,
    anchor: 0.5,
  });
  sceneContainer.addChild(rbElement);

  const centerElement = new Sprite({
    texture: texture,
    x: sceneSizeX / 2 - texture.width / 2 + (texture.width / 2) * scale,
    y: sceneSizeY / 2 - texture.height / 2 + (texture.height / 2) * scale,
    scale: scale,
    anchor: 0.5,
  });
  sceneContainer.addChild(centerElement);

  // sort the trees by their y position
  sceneContainer.children.sort((a, b) => a.position.y - b.position.y);
};

export const initWorld = async (app: Application) => {
  const world = newWorld();

  // # Main Scene Container
  // ## Data
  const sceneSizeX = 2000;
  const sceneSizeY = 1000;
  const sceneBoundLX = 0;
  const sceneBoundTY = 0;
  // let sceneBoundRX = -sceneSizeX;
  // let sceneBoundBY = -sceneSizeY;

  // ## Container
  const sceneContainer = new Container({
    isRenderGroup: true,
  });

  app.stage.addChild(sceneContainer);

  // ## Fill with some data
  fillSceneContainer(sceneSizeX, sceneSizeY, sceneContainer);

  // # Camera
  let cameraX = 0;
  let cameraY = 0;
  let cameraWidth = app.renderer.width;
  let cameraHeight = app.renderer.height;
  let cameraBoundLX = 0;
  let cameraBoundLY = 0;
  let cameraBoundRX = sceneSizeX - cameraWidth;
  let cameraBoundRY = sceneSizeY - cameraHeight;

  // ## On resize change camera last coordinates
  app.canvas.addEventListener('resize', () => {
    cameraWidth = app.renderer.width;
    cameraHeight = app.renderer.width;
    cameraBoundRX = sceneSizeX - cameraWidth;
    cameraBoundRY = sceneSizeY - cameraHeight;

    if (cameraX > cameraBoundRX) {
      cameraX = cameraBoundRX;
    }
    if (cameraY > cameraBoundRY) {
      cameraY = cameraBoundRY;
    }
  });

  // ## Set camera to center
  cameraX = sceneSizeX / 2 - cameraWidth / 2;
  cameraY = sceneSizeY / 2 - cameraHeight / 2;

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
      const newCameraX = cameraX - e.movementX;
      const newCameraY = cameraY - e.movementY;

      if (cameraX < cameraBoundLX) {
        cameraX = cameraBoundLX;
      } else if (cameraX > cameraBoundRX) {
        cameraX = cameraBoundRX;
      } else {
        cameraX = newCameraX;
      }

      if (cameraY < cameraBoundLY) {
        cameraY = cameraBoundLY;
      } else if (cameraY > cameraBoundRY) {
        cameraY = cameraBoundRY;
      } else {
        cameraY = newCameraY;
      }
    }

    // # Apply camera to scene
    sceneContainer.x = -cameraX;
    sceneContainer.y = -cameraY;

    if (sceneContainer.x > sceneBoundLX) {
      sceneContainer.x = sceneBoundLX;
    } else if (sceneContainer.x < -cameraBoundRX) {
      sceneContainer.x = -cameraBoundRX;
    } else if (sceneContainer.y > sceneBoundTY) {
      sceneContainer.y = sceneBoundTY;
    }

    if (sceneContainer.y < -cameraBoundRY) {
      sceneContainer.y = -cameraBoundRY;
    } else if (sceneContainer.y > sceneBoundTY) {
      sceneContainer.y = sceneBoundTY;
    } else if (sceneContainer.y < -cameraBoundRY) {
      sceneContainer.y = -cameraBoundRY;
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

  // const entity = spawnEntity(world);
  // const circle = new Graphics().circle(0, 0, 50);
  // setComponent(world, entity, View);
  // setComponent(world, entity, pGraphics, { value: circle });
  // setComponent(world, entity, Position, { x: 100, y: 100 });
  // setComponent(world, entity, Size, { width: 100, height: 100 });
  // setComponent(world, entity, Color, { value: 'red' });

  return world;
};

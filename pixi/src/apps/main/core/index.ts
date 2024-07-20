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
  const arrowTexture = await Assets.load('assets/arrow_E.png');

  for (let i = 0; i < 1000; i++) {
    const tree = new Sprite({
      texture: arrowTexture,
      x: Math.random() * sceneSizeX,
      y: Math.random() * sceneSizeY,
      scale: 0.25,
      anchor: 0.5,
    });

    sceneContainer.addChild(tree);
  }

  // sort the trees by their y position
  sceneContainer.children.sort((a, b) => a.position.y - b.position.y);
};

export const initWorld = async (app: Application) => {
  const world = newWorld();

  // # Main Scene Container
  const sceneContainer = new Container({
    isRenderGroup: true,
  });

  app.stage.addChild(sceneContainer);

  const sceneSizeX = 5000;
  const sceneSizeY = 5000;
  const sceneBoundLX = 0;
  const sceneBoundTY = 0;
  let sceneBoundRX = -sceneSizeX + app.renderer.width;
  let sceneBoundRY = -sceneSizeY + app.renderer.height;

  // ## Fill with some data
  fillSceneContainer(sceneSizeX, sceneSizeY, sceneContainer);

  // # Camera
  let cameraLX = 0;
  let cameraLY = 0;
  let cameraBoundLX = 0;
  let cameraBoundLY = 0;
  let cameraBoundRX = -sceneBoundRX;
  let cameraBoundRY = -sceneBoundRY;
  // let cameraRX = app.renderer.width;
  // let cameraRY = app.renderer.height;

  app.canvas.addEventListener('resize', () => {
    sceneBoundRX = -sceneSizeX + app.renderer.width;
    sceneBoundRY = -sceneSizeY + app.renderer.height;

    // cameraRX = app.renderer.width;
    // cameraRY = app.renderer.height;
  });

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
      const newCameraX = cameraLX - e.movementX;
      const newCameraY = cameraLY - e.movementY;

      if (cameraLX < cameraBoundLX) {
        cameraLX = cameraBoundLX;
      } else if (cameraLX > cameraBoundRX) {
        cameraLX = cameraBoundRX;
      } else {
        cameraLX = newCameraX;
      }

      if (cameraLY < cameraBoundLY) {
        cameraLY = cameraBoundLY;
      } else if (cameraLY > cameraBoundRY) {
        cameraLY = cameraBoundRY;
      } else {
        cameraLY = newCameraY;
      }
    }

    // # Apply camera to scene
    sceneContainer.x = -cameraLX;
    sceneContainer.y = -cameraLY;

    if (sceneContainer.x > sceneBoundLX) {
      sceneContainer.x = sceneBoundLX;
    } else if (sceneContainer.x < sceneBoundRX) {
      sceneContainer.x = sceneBoundRX;
    } else if (sceneContainer.y > sceneBoundTY) {
      sceneContainer.y = sceneBoundTY;
    }

    if (sceneContainer.y < sceneBoundRY) {
      sceneContainer.y = sceneBoundRY;
    } else if (sceneContainer.y > sceneBoundTY) {
      sceneContainer.y = sceneBoundTY;
    } else if (sceneContainer.y < sceneBoundRY) {
      sceneContainer.y = sceneBoundRY;
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

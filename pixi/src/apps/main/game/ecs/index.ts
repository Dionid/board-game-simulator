// # Schemas
import { Graphics, Application } from 'pixi.js';
import {
  newTag,
  $kind,
  $defaultFn,
  newSchema,
  number,
  string,
  World,
  registerQuery,
  System,
  table,
  tryTable,
} from '../../../../libs/tecs';
import { Query } from '../../../../libs/tecs/query';
import { WorldScene } from '../engine';
export * from './input-mapping';

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

// # Queries

const drawQuery = Query.new(View, Position);

// # Systems

export function moveCameraByDragging(worldScene: WorldScene): System {
  const camera = worldScene.cameras.main;
  const mouse = worldScene.input.mouse;

  const cameraSpeed = 1.2;

  return () => {
    // # Calculate new camera
    if (mouse.down) {
      let newCameraX = camera.position.x - mouse.delta.clientPosition.x * cameraSpeed;
      let newCameraY = camera.position.y - mouse.delta.clientPosition.y * cameraSpeed;

      if (newCameraX < 0) {
        newCameraX = 0;
      } else if (newCameraX > worldScene.size.width - camera.width) {
        newCameraX = worldScene.size.width - camera.width;
      }

      if (newCameraY < 0) {
        newCameraY = 0;
      } else if (newCameraY > worldScene.size.height - camera.height) {
        newCameraY = worldScene.size.height - camera.height;
      }

      camera.target.position.x = newCameraX;
      camera.target.position.y = newCameraY;
    }
  };
}

export function moveCamera(worldScene: WorldScene): System {
  const camera = worldScene.cameras.main;

  return () => {
    const newCameraX = camera.target.position.x;
    const newCameraY = camera.target.position.y;

    // # Calculate steps
    let stepX = (newCameraX - camera.position.x) * 1;
    let stepY = (newCameraY - camera.position.y) * 1;

    // # Apply step threshold
    if (Math.abs(stepX) < 0.0001) {
      stepX = newCameraX - camera.position.x;
    }

    if (Math.abs(stepY) < 0.0001) {
      stepY = newCameraY - camera.position.y;
    }

    camera.position.x += stepX;
    camera.position.y += stepY;

    camera.scaled.position.x = camera.position.x / camera.scale;
    camera.scaled.position.y = camera.position.y / camera.scale;
  };
}

export const zoom = (worldScene: WorldScene): System => {
  const camera = worldScene.cameras.main;

  let scaleEvent: KeyboardEvent | null = null;

  window.addEventListener('keydown', (e) => {
    // if arrow up
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') {
      return;
    }

    scaleEvent = e;
  });

  const calculateScale = (scaleEvent: KeyboardEvent) => {
    const delta = scaleEvent.key === 'ArrowUp' ? 0.1 : -0.1;

    let newScale = parseFloat((camera.scale + delta).toFixed(1));

    if (newScale < 0.5) {
      return camera.scale;
    } else if (newScale > 2) {
      return camera.scale;
    } else if (camera.width / newScale > worldScene.size.width) {
      return camera.width / worldScene.size.width;
    } else if (camera.height / newScale > worldScene.size.height) {
      return camera.height / worldScene.size.height;
    }

    return newScale;
  };

  return ({ world, deltaFrameTime }) => {
    if (scaleEvent !== null) {
      const newScale = calculateScale(scaleEvent);
      camera.target.scale = newScale;
      scaleEvent = null;
    }

    const newScale = camera.target.scale;

    if (camera.scale === newScale) {
      return;
    }

    // # Calculate step
    let step = (newScale - camera.scale) * 0.3;

    // # Apply step threshold
    if (Math.abs(step) < 0.0001) {
      step = newScale - camera.scale;
    }

    camera.scale += step;
  };
};

export const applyCameraToContainer = (worldScene: WorldScene): System => {
  const camera = worldScene.cameras.main;
  const container = worldScene.container;

  return () => {
    // # Position
    // # NEED TO BE UNSCALED
    container.x = -camera.position.x;
    container.y = -camera.position.y;
    // # Scale
    container.scale.x = camera.scale;
    container.scale.y = camera.scale;
  };
};

export const render = (world: World, app: Application): System => {
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

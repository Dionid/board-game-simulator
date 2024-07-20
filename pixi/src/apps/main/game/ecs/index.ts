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

  return () => {
    // # Calculate new camera
    if (mouse.down) {
      const deltaX = mouse.delta.clientPosition.x;
      const deltaY = mouse.delta.clientPosition.y;

      const newCameraX = camera.position.x - deltaX;
      const newCameraY = camera.position.y - deltaY;

      if (newCameraX < 0) {
        camera.position.x = 0;
      } else if (newCameraX > worldScene.size.width - camera.width) {
        camera.position.x = worldScene.size.width - camera.width;
      } else {
        camera.position.x = newCameraX;
      }

      if (newCameraY < 0) {
        camera.position.y = 0;
      } else if (newCameraY > worldScene.size.height - camera.height) {
        camera.position.y = worldScene.size.height - camera.height;
      } else {
        camera.position.y = newCameraY;
      }

      camera.scaled.position.x = camera.position.x / camera.scale;
      camera.scaled.position.y = camera.position.y / camera.scale;
    }
  };
}

export const applyCameraToContainer = (worldScene: WorldScene): System => {
  const camera = worldScene.cameras.main;
  const container = worldScene.container;

  return () => {
    // # Position
    container.x = -camera.position.x;
    container.y = -camera.position.y;
    // # Scale
    container.scale.x = camera.scale;
    container.scale.y = camera.scale;
  };
};

export const zoom = (worldScene: WorldScene): System => {
  const camera = worldScene.cameras.main;

  window.addEventListener('keydown', (e) => {
    // if arrow up
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') {
      return;
    }

    const delta = e.key === 'ArrowUp' ? 0.1 : -0.1;

    let newScale = parseFloat((camera.scale + delta).toFixed(1));

    if (newScale < 0.5) {
      return;
    } else if (newScale > 2) {
      return;
    } else if (camera.width / newScale > worldScene.size.width) {
      newScale = camera.width / worldScene.size.width;
    } else if (camera.height / newScale > worldScene.size.height) {
      newScale = camera.height / worldScene.size.height;
    }

    camera.target.scale = newScale;
  });

  if (typeof worldScene.container.scale === 'number') {
    throw new Error('Container scale is a number');
  }

  return ({ world, deltaFrameTime }) => {
    const newScale = camera.target.scale;

    if (camera.scale === newScale) {
      return;
    }

    // # Calculate step
    let step = (newScale - camera.scale) * 0.1;

    // # Apply step threshold
    if (Math.abs(step) < 0.0001) {
      step = newScale - camera.scale;
    }

    camera.scale += step;
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

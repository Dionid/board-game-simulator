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
      // const deltaX = mouse.clientPosition.x - mouse.previous.clientPosition.x;
      // const deltaY = mouse.clientPosition.y - mouse.previous.clientPosition.y;

      const deltaX = mouse.delta.clientPosition.x;
      const deltaY = mouse.delta.clientPosition.y;

      const newCameraX = camera.position.x - deltaX;
      const newCameraY = camera.position.y - deltaY;

      if (camera.position.x < camera.boundLX) {
        camera.position.x = camera.boundLX;
      } else if (camera.position.x > camera.boundRX) {
        camera.position.x = camera.boundRX;
      } else {
        camera.position.x = newCameraX;
      }

      if (camera.position.y < camera.boundLY) {
        camera.position.y = camera.boundLY;
      } else if (camera.position.y > camera.boundRY) {
        camera.position.y = camera.boundRY;
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
    // # Apply camera to scene
    container.x = -camera.position.x;
    container.y = -camera.position.y;

    if (container.x > worldScene.boundLX) {
      container.x = worldScene.boundLX;
    } else if (container.x < -camera.boundRX) {
      container.x = -camera.boundRX;
    } else if (container.y > worldScene.boundTY) {
      container.y = worldScene.boundTY;
    }

    if (container.y < -camera.boundRY) {
      container.y = -camera.boundRY;
    } else if (container.y > worldScene.boundTY) {
      container.y = worldScene.boundTY;
    } else if (container.y < -camera.boundRY) {
      container.y = -camera.boundRY;
    }
  };
};

export const zoom = (worldScene: WorldScene): System => {
  const camera = worldScene.cameras.main;
  const container = worldScene.container;

  // let newScale = camera.scale;

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

    let step = (newScale - camera.scale) * 0.1;

    if (Math.abs(step) < 0.0001) {
      step = newScale - camera.scale;
    }

    camera.scale += step;

    container.scale.x = camera.scale;
    container.scale.y = camera.scale;
  };
};

export const draw = (world: World, app: Application): System => {
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

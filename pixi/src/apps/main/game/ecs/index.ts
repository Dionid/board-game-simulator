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

export function mapMouseInput(worldScene: WorldScene): System {
  const input = worldScene.input;
  const mouse = input.mouse;
  const canvas = worldScene.app.canvas;

  let mouseUp = false;
  let mouseDown = false;
  let mouseMoveEvent: MouseEvent | null = null;

  canvas.addEventListener('mousedown', (e) => {
    mouseDown = true;
  });

  canvas.addEventListener('mouseup', (e) => {
    mouseUp = true;
  });

  // # Mouse move
  canvas.addEventListener('mousemove', (e) => {
    mouseMoveEvent = e;
  });

  return () => {
    if (mouseDown) {
      mouse.previous.down = mouse.down;
      mouse.previous.up = mouse.up;

      mouse.down = true;
      mouse.up = false;

      mouseDown = false;
    }

    if (mouseUp) {
      mouse.previous.down = mouse.down;
      mouse.previous.up = mouse.up;

      mouse.down = false;
      mouse.up = true;

      mouseUp = false;
    }

    if (mouseMoveEvent) {
      mouse.previous.clientPosition.x = mouse.clientPosition.x;
      mouse.previous.clientPosition.y = mouse.clientPosition.y;
      mouse.previous.scenePosition.x = mouse.scenePosition.x;
      mouse.previous.scenePosition.y = mouse.scenePosition.y;

      mouse.clientPosition.x = mouseMoveEvent.x;
      mouse.clientPosition.y = mouseMoveEvent.y;

      mouse.scenePosition.x = Math.floor(
        mouseMoveEvent.x / worldScene.cameras.main.scale + worldScene.cameras.main.scaledPosition.x
      );
      mouse.scenePosition.y = Math.floor(
        mouseMoveEvent.y / worldScene.cameras.main.scale + worldScene.cameras.main.scaledPosition.y
      );
      mouseMoveEvent = null;
    }
  };
}

export function MoveCameraByDragging(worldScene: WorldScene): System {
  const camera = worldScene.cameras.main;

  return () => {
    // # Calculate new camera
    if (worldScene.input.mouse.down) {
      const deltaX = worldScene.input.mouse.clientPosition.x - worldScene.input.mouse.previous.clientPosition.x;
      const deltaY = worldScene.input.mouse.clientPosition.y - worldScene.input.mouse.previous.clientPosition.y;

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

      camera.scaledPosition.x = camera.position.x / camera.scale;
      camera.scaledPosition.y = camera.position.y / camera.scale;
    }
  };
}

export const ApplyCameraToContainer = (worldScene: WorldScene): System => {
  const camera = worldScene.cameras.main;

  return () => {
    // # Apply camera to scene
    worldScene.container.x = -camera.position.x;
    worldScene.container.y = -camera.position.y;

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

export const Zoom = (worldScene: WorldScene): System => {
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

    camera.scale = newScale;
  });

  return ({ world, deltaFrameTime }) => {
    if (typeof worldScene.container.scale === 'number') {
      if (worldScene.cameras.main.scale === worldScene.container.scale) {
        return;
      }
      worldScene.container.scale += (worldScene.cameras.main.scale - worldScene.container.scale) * 0.1;
    } else {
      if (
        worldScene.cameras.main.scale === worldScene.container.scale.x &&
        worldScene.cameras.main.scale === worldScene.container.scale.y
      ) {
        return;
      }

      let stepX = (worldScene.cameras.main.scale - worldScene.container.scale.x) * 0.1;
      let stepY = (worldScene.cameras.main.scale - worldScene.container.scale.x) * 0.1;

      if (Math.abs(stepX) < 0.0001) {
        stepX = worldScene.cameras.main.scale - worldScene.container.scale.x;
      }

      if (Math.abs(stepY) < 0.0001) {
        stepY = worldScene.cameras.main.scale - worldScene.container.scale.x;
      }

      const newScaleX = worldScene.container.scale.x + stepX;
      const newScaleY = worldScene.container.scale.y + stepY;

      worldScene.container.scale.x = newScaleX;
      worldScene.container.scale.y = newScaleY;
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

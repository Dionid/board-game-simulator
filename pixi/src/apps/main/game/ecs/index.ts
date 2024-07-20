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

    camera.scale += delta;

    // let newCameraWidth = camera.width;
    // let newCameraHeight = camera.height;

    // if (delta > 0) {
    //   newCameraWidth = camera.width + camera.width * scale;
    //   newCameraHeight = camera.height + camera.height * scale;
    // } else {
    //   newCameraWidth = camera.width - camera.width * scale;
    //   newCameraHeight = camera.height - camera.height * scale;
    // }

    // if (newCameraWidth < worldScene.size.width) {
    //   camera.width = newCameraWidth;
    // }

    // if (newCameraHeight < worldScene.size.height) {
    //   camera.height = newCameraHeight;
    // }

    // console.log('camera', camera);

    // ---

    // if (delta > 0) {
    //   camera.width += camera.width * scale;
    //   camera.height += camera.height * scale;
    // } else {
    //   camera.width -= camera.width * scale;
    //   camera.height -= camera.height * scale;
    // }

    // camera.boundRX = worldScene.size.x - camera.width;
    // camera.boundRY = worldScene.size.y - camera.height;

    // if (camera.position.x > camera.boundRX) {
    //   camera.position.x = camera.boundRX;
    // }
    // if (camera.position.y > camera.boundRY) {
    //   camera.position.y = camera.boundRY;
    // }
  });

  return ({ world, deltaFrameTime }) => {
    worldScene.container.scale = worldScene.cameras.main.scale;
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

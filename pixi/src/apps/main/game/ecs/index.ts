// # Schemas
import { Graphics, Application } from 'pixi.js';
import {
  newTag,
  $kind,
  $defaultFn,
  newSchema,
  number,
  string,
  newTopic,
  Entity,
  setComponent,
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

// # Topics
export const clicked = newTopic<{ type: 'clicked'; position: { x: number; y: number } }>();
export const viewEvents = newTopic<{ type: 'pointerOver'; entity: Entity }>();

// # Queries

export const drawQuery = Query.new(View, Position);

// # Systems

export const ApplyCameraToScene = (worldScene: WorldScene): System => {
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

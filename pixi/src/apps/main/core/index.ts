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
import { hasSchema } from '../../../libs/tecs/archetype';
import { Query } from '../../../libs/tecs/query';
import { Application, Graphics } from 'pixi.js';

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

export const Velocity = newSchema({
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

export const Gravity = (world: World): System => {
  const query = registerQuery(world, Query.new(Velocity));

  return ({ deltaFrameTime }) => {
    for (const archetype of query.archetypes) {
      const velocity = table(archetype, Velocity);

      for (let i = 0, l = archetype.entities.length; i < l; i++) {
        velocity[i].y += 0.1 * deltaFrameTime;
      }
    }
  };
};

export const SetPosition = (world: World): System => {
  const query = registerQuery(world, Query.new(Position, Velocity));

  return ({ world, deltaFrameTime }) => {
    for (const archetype of query.archetypes) {
      const position = table(archetype, Position);
      const velocity = table(archetype, Velocity);

      for (let i = 0, l = archetype.entities.length; i < l; i++) {
        position[i].x += velocity[i].x;
        position[i].y += velocity[i].y;
      }
    }
  };
};

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
      const entity = spawnEntity(world);

      const circle = new Graphics().circle(0, 0, 50).fill('red');
      setComponent(world, entity, View);
      setComponent(world, entity, pGraphics, { value: circle });
      setComponent(world, entity, Position, { x: event.position.x, y: event.position.y });
      setComponent(world, entity, Color, { value: 'red' });
      setComponent(world, entity, Velocity, { x: 0, y: 0 });

      circle.eventMode = 'static';
      circle.on('pointerover', () => {
        Topic.emit(viewEvents, { type: 'pointerOver', entity });
      });
    }
  };
};

export const Draw = (world: World, app: Application): System => {
  const query = registerQuery(world, drawQuery);

  return ({ world, deltaFrameTime }) => {
    for (const archetype of query.archetypes) {
      const positionT = table(archetype, Position);
      const withPGraphics = hasSchema(archetype, pGraphics);
      const withColor = hasSchema(archetype, Color);

      for (let i = 0, l = archetype.entities.length; i < l; i++) {
        if (withPGraphics) {
          const graphicsT = table(withPGraphics, pGraphics);

          const graphics = graphicsT[i].value;

          graphics.clear();
          graphics.circle(positionT[i].x, positionT[i].y, 50);

          if (withColor) {
            const colorT = table(withColor, Color);
            graphics.fill(colorT[i].value);
          }

          if (graphics.parent === null) {
            app.stage.addChild(graphics);
          }
        }
      }
    }

    app.render();
    // app.ticker.update(world.currentStepTime);
  };
};

export const initWorld = (app: Application) => {
  const world = newWorld();

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

  const entity = spawnEntity(world);
  const circle = new Graphics().circle(0, 0, 50);
  setComponent(world, entity, View);
  setComponent(world, entity, pGraphics, { value: circle });
  setComponent(world, entity, Position, { x: 100, y: 100 });
  setComponent(world, entity, Velocity, { x: 0, y: 0 });
  setComponent(world, entity, Size, { width: 100, height: 100 });
  setComponent(world, entity, Color, { value: 'red' });

  return world;
};

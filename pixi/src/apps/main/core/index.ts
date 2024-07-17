import {
  $defaultFn,
  $kind,
  newSchema,
  newWorld,
  number,
  string,
  System,
  table,
  registerSchema,
  registerSystem,
  spawnEntity,
  setComponent,
  World,
  registerQuery,
} from '../../../libs/tecs';
import { Query } from '../../../libs/tecs/query';
import { Application, Graphics as pGraphics } from 'pixi.js';

// # Schemas

export const $graphics = Symbol('graphics');

export const graphics = {
  [$kind]: $graphics,
  byteLength: 8,
  [$defaultFn]: () => new pGraphics(),
} as const;

export const Graphics = newSchema({
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

// # Queries

const drawQuery = Query.new(Graphics, Position, Color);

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

export const Draw = (world: World, app: Application): System => {
  const query = registerQuery(world, drawQuery);

  return ({ world, deltaFrameTime }) => {
    for (const archetype of query.archetypes) {
      const graphics = table(archetype, Graphics);
      const position = table(archetype, Position);
      const color = table(archetype, Color);

      for (let i = 0, l = archetype.entities.length; i < l; i++) {
        graphics[i].value.x = position[i].x;
        graphics[i].value.y = position[i].y;
        graphics[i].value.fill(color[i].value);
      }
    }

    app.ticker.update();
  };
};

export const initWorld = (app: Application) => {
  const world = newWorld();

  // # (optional) Schemas
  registerSchema(Graphics);
  registerSchema(Position);
  registerSchema(Size);
  registerSchema(Color);

  // # Systems
  registerSystem(world, Gravity(world));
  registerSystem(world, SetPosition(world));
  registerSystem(world, Draw(world, app));

  const entity = spawnEntity(world);
  const circle = new pGraphics().circle(0, 0, 50);
  setComponent(world, entity, Graphics, { value: circle });
  setComponent(world, entity, Position, { x: 100, y: 100 });
  setComponent(world, entity, Velocity, { x: 0, y: 0 });
  setComponent(world, entity, Size, { width: 100, height: 100 });
  setComponent(world, entity, Color, { value: 'red' });

  app.stage.addChild(circle);

  return world;
};

// # Schemas
import { Graphics, Application } from 'pixi.js';
import {
  newTag,
  $kind,
  $defaultFn,
  newSchema,
  number,
  string,
  Essence,
  registerQuery,
  System,
  table,
  tryTable,
} from '../../tecs';
import { Query } from '../../../libs/tecs/query';
import { Game } from '../game';
export * from './input-mapping';
export * from './camera';
export * from './world';

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

export const render = (game: Game): System => {
  const query = registerQuery(game.essence, drawQuery);

  return () => {
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
            game.app.stage.addChild(graphics);
          }
        }
      }
    }

    game.app.render();
  };
};

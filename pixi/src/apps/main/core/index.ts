import { newSchema, number, string, System } from '../../../libs/tecs';
import { Query } from '../../../libs/tecs/query';

// # Schemas

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

// # Systems

const Draw = (): System => {
  // const query = Query.new(Position, Size, Color)

  return ({ world }) => {
    // for (const archetype of query.archetypes) {
    // }
  };
};

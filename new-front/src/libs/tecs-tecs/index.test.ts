import { number, Tag } from './schema';
import { World } from './index';

const Position = {
  x: number,
  y: number,
};

const Velocity = {
  x: number,
  y: number,
  z: number,
};

const Speed = {
  value: number,
};

const Player = Tag.new();

const world = World.new();

export const withoutQuery = () => {
  const archetype1 = World.registerArchetype(world, Position, Speed);

  const byGetComponentTable = () => {
    const position = World.archetypeTable(world, archetype1, Position);
    const speed = World.archetypeTable(world, archetype1, Speed);
    // @ts-expect-error: Velocity is not in the archetype
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const velocity = World.archetypeTable(world, archetype1, Velocity);

    for (let i = 0; i < archetype1.entities.length; i++) {
      position[i].x += 1;
      position[i].y += 1;

      speed[i].value += 1;
    }
  };

  byGetComponentTable();

  const byGetComponentTablesList = () => {
    const [position] = World.archetypeTablesList(world, archetype1, Position);
    const [speed] = World.archetypeTablesList(world, archetype1, Speed, Position);

    // @ts-expect-error: Velocity is not in the archetype
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [velocity] = World.archetypeTablesList(world, archetype1, Velocity);

    for (let i = 0; i < archetype1.entities.length; i++) {
      position[i].x += 1;
      position[i].y += 1;

      speed[i].value += 1;
    }
  };

  byGetComponentTablesList();

  const byGetComponentsList = () => {
    for (const entity of archetype1.entities) {
      const [position, speed] = World.componentsList(archetype1, entity, Position, Speed);
      // @ts-expect-error: Velocity is not in the archetype
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [velocity] = World.componentsList(world, archetype1, entity, Velocity);

      position.x += 1;
      position.y += 1;

      speed.value += 1;
    }
  };

  byGetComponentsList();

  const byGetComponent = () => {
    for (const entity of archetype1.entities) {
      const position = World.component(archetype1, entity, Position);
      const speed = World.component(archetype1, entity, Speed);
      // @ts-expect-error: Velocity is not in the archetype
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [velocity] = World.component(archetype1, entity, Velocity);

      position.x += 1;
      position.y += 1;

      speed.value += 1;
    }
  };

  byGetComponent();
};

describe('aws', () => {
  it('should be true', () => {
    expect(true).toBe(true);

    const world = World.new();

    const PositionArchetype = World.registerArchetype(world, Position);

    expect(PositionArchetype.type.length).toEqual(1);

    const SpeedArchetype = World.registerArchetype(world, Speed);

    expect(SpeedArchetype.type.length).toEqual(1);

    const MovementArchetype = World.registerArchetype(world, Position, Speed);

    expect(MovementArchetype.type.length).toEqual(2);

    const entity = World.spawnEntity(world);

    World.setComponent(world, entity, Position, { x: 10, y: 20 });

    // console.log('PositionArchetype', PositionArchetype.entities, PositionArchetype.table);

    expect(PositionArchetype.entities.length).toEqual(1);
    expect(PositionArchetype.table[0].length).toEqual(1);

    World.setComponent(world, entity, Speed, { value: 5 });

    expect(PositionArchetype.entities.length).toEqual(0);
    expect(PositionArchetype.table[0].length).toEqual(0);

    expect(SpeedArchetype.entities.length).toEqual(0);
    // @ts-expect-error: can't find other way
    expect(SpeedArchetype.table[1].length).toEqual(0);

    expect(MovementArchetype.entities.length).toEqual(1);
    expect(MovementArchetype.table[0].length).toEqual(1);
    expect(MovementArchetype.table[1].length).toEqual(1);
  });

  it('should be true', () => {
    expect(true).toBe(true);

    const world = World.new();

    const PositionArchetype = World.registerArchetype(world, Position);
    const PlayerPositionArchetype = World.registerArchetype(world, Position, Player);

    expect(PositionArchetype.type.length).toEqual(1);

    const entity = World.spawnEntity(world);

    World.setComponent(world, entity, Position, { x: 10, y: 20 });

    expect(PositionArchetype.entities.length).toEqual(1);
    expect(PositionArchetype.table[0].length).toEqual(1);

    World.setComponent(world, entity, Player);

    console.log('PlayerPositionArchetype', PlayerPositionArchetype);
  });
});

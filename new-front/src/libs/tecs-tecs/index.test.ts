import { number } from './schema';
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
      const [position, speed] = World.componentsListByArchetype(world, archetype1, entity, Position, Speed);
      // @ts-expect-error: Velocity is not in the archetype
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [velocity] = World.componentsListByArchetype(world, archetype1, entity, Velocity);

      position.x += 1;
      position.y += 1;

      speed.value += 1;
    }
  };

  byGetComponentsList();

  const byGetComponent = () => {
    for (const entity of archetype1.entities) {
      const position = World.componentByArchetype(world, archetype1, entity, Position);
      const speed = World.componentByArchetype(world, archetype1, entity, Speed);
      // @ts-expect-error: Velocity is not in the archetype
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [velocity] = World.componentByArchetype(world, archetype1, entity, Velocity);

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
    const SpeedArchetype = World.registerArchetype(world, Speed);
    const MovementArchetype = World.registerArchetype(world, Position, Speed);

    console.log('MovementArchetype', MovementArchetype);

    const entity = World.spawnEntity(world);

    World.setComponent(world, entity, Position, { x: 10, y: 20 });

    console.log('PositionArchetype', PositionArchetype.entities, PositionArchetype.table);

    World.setComponent(world, entity, Speed, { value: 5 });

    console.log('PositionArchetype', PositionArchetype.entities, PositionArchetype.table);
    console.log('SpeedArchetype', SpeedArchetype.entities, SpeedArchetype.table);
    console.log('MovementArchetype', MovementArchetype.entities, MovementArchetype.table);
  });
});

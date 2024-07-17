import { World, Schema, number, Tag, arrayOf, string } from './index';

const Position = Schema.new({
  x: number,
  y: number,
});

const Velocity = Schema.new({
  x: number,
  y: number,
});

const Speed = Schema.new({
  value: number,
});

const Player = Tag.new();

const Comments = Schema.new({
  value: arrayOf(string),
});

const NamedTags = Schema.new({
  value: arrayOf(arrayOf(string)),
});

export const withoutQuery = () => {
  const world = World.new();

  const archetype1 = World.registerArchetype(world, Position, Speed);

  const byGetComponentTable = () => {};

  byGetComponentTable();

  const byGetComponentTablesList = () => {
    const [position] = World.archetypeTablesList(world, archetype1, Position);
    const [speed] = World.archetypeTablesList(world, archetype1, Speed, Position);

    // TODO: MUST BE ERROR
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
  it('should move entity', () => {
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

  describe('tag', () => {
    it('should be added', () => {
      const world = World.new();

      const PositionArchetype = World.registerArchetype(world, Position);
      const PlayerPositionArchetype = World.registerArchetype(world, Position, Player);

      expect(PositionArchetype.type.length).toEqual(1);

      const entity = World.spawnEntity(world);

      World.setComponent(world, entity, Position, { x: 10, y: 20 });

      expect(PositionArchetype.entities.length).toEqual(1);
      expect(PositionArchetype.table[0].length).toEqual(1);

      World.setComponent(world, entity, Player);

      expect(PlayerPositionArchetype.entities.length).toEqual(1);
      expect(PlayerPositionArchetype.table[World.getSchemaId(Position)].length).toEqual(1);
      expect(PlayerPositionArchetype.table[World.getSchemaId(Player)].length).toEqual(0);
    });
  });

  describe('spawn and kill entity', () => {
    it('should be 0 in the end', () => {
      const world = World.new();
      expect(world.entityGraveyard.length).toEqual(0);

      const PositionArchetype = World.registerArchetype(world, Position);

      expect(PositionArchetype.entities.length).toEqual(0);

      const entity = World.spawnEntity(world, PositionArchetype);

      expect(PositionArchetype.entities.length).toEqual(1);

      World.killEntity(world, entity);

      expect(PositionArchetype.entities.length).toEqual(0);
      expect(world.entityGraveyard.length).toEqual(1);
    });
    it('should be 0 in the end', () => {
      const world = World.new();
      expect(world.entityGraveyard.length).toEqual(0);

      const PositionArchetype = World.registerArchetype(world, Position);

      expect(PositionArchetype.entities.length).toEqual(0);

      const entity = World.spawnEntity(world);

      World.setComponent(world, entity, Position, { x: 10, y: 20 });

      expect(PositionArchetype.entities.length).toEqual(1);

      World.killEntity(world, entity);

      expect(world.entityGraveyard.length).toEqual(1);
      expect(PositionArchetype.entities.length).toEqual(0);
    });
    it('should be 0 in the end', () => {
      const world = World.new();
      expect(world.entityGraveyard.length).toEqual(0);

      const PositionArchetype = World.registerArchetype(world, Position);

      expect(PositionArchetype.entities.length).toEqual(0);

      const num = 100;

      const entities = [];

      for (let i = 0; i < num; i++) {
        const entity = World.spawnEntity(world);
        World.setComponent(world, entity, Position, { x: 10, y: 20 });
        entities.push(entity);
      }

      expect(PositionArchetype.entities.length).toEqual(num);

      for (const entity of entities) {
        World.killEntity(world, entity);
      }

      expect(world.entityGraveyard.length).toEqual(num);
      expect(PositionArchetype.entities.length).toEqual(0);
    });
  });

  describe('query', () => {
    it('should get entities', () => {
      const world = World.new();

      World.registerArchetype(world, Position);
      World.registerArchetype(world, Position, Player);

      const num = 100;

      for (let i = 0; i < num; i++) {
        const entity = World.spawnEntity(world);
        World.setComponent(world, entity, Position, { x: 10, y: 20 });
      }

      const query = World.registerQuery(world, Position);

      expect(query.archetypes.length).toBe(2);
      expect(query.archetypes.some((arch) => arch.entities.length === num)).toBe(true);
    });
    it('should get entities', () => {
      const world = World.new();
      const query = World.registerQuery(world, Position);
      expect(query.archetypes.length).toBe(0);

      World.registerArchetype(world, Position);
      World.registerArchetype(world, Position, Player);

      const num = 100;

      for (let i = 0; i < num; i++) {
        const entity = World.spawnEntity(world);
        World.setComponent(world, entity, Position, { x: 10, y: 20 });
      }

      expect(query.archetypes.length).toBe(2);
      expect(query.archetypes.some((arch) => arch.entities.length === num)).toBe(true);
    });
    it('should get entities', () => {
      const world = World.new();

      World.registerArchetype(world, Position);
      World.registerArchetype(world, Position, Player);

      const query = World.registerQuery(world, Position);
      expect(query.archetypes.length).toBe(2);

      World.registerArchetype(world, Position, Speed);

      expect(query.archetypes.length).toBe(3);

      const num = 100;

      for (let i = 0; i < num; i++) {
        const entity = World.spawnEntity(world);
        World.setComponent(world, entity, Position, { x: 10, y: 20 });
      }

      expect(query.archetypes.length).toBe(3);
      expect(query.archetypes.some((arch) => arch.entities.length === num)).toBe(true);
    });
  });
  describe('component', () => {
    it('should change', () => {
      const world = World.new();

      World.registerArchetype(world, Position);
      World.registerArchetype(world, Speed);

      const query = World.registerQuery(world, Position, Speed);

      for (const archetype of query.archetypes) {
        const position = World.archetypeTable(world, archetype, Position);
        const speed = World.archetypeTable(world, archetype, Speed);

        expect(archetype.entities.length).toBe(0);

        for (let i = 0; i < archetype.entities.length; i++) {
          position[i].x += 1;
          position[i].y += 1;

          speed[i].value += 1;
        }
      }

      const num = 100;

      for (let i = 0; i < num; i++) {
        const entity = World.spawnEntity(world);
        World.setComponent(world, entity, Position, { x: 10, y: 20 });
      }

      expect(query.archetypes.length).toBe(0);

      for (let i = 0; i < num; i++) {
        const entity = World.spawnEntity(world);
        World.setComponent(world, entity, Position, { x: 10, y: 20 });
        World.setComponent(world, entity, Speed, { value: 5 });
      }

      expect(query.archetypes.length).toBe(1);

      for (const archetype of query.archetypes) {
        const position = World.archetypeTable(world, archetype, Position);
        const speed = World.archetypeTable(world, archetype, Speed);

        expect(archetype.entities.length).toBe(num);

        for (let i = 0; i < archetype.entities.length; i++) {
          position[i].x += 1;
          position[i].y += 1;

          speed[i].value += 1;
        }
      }

      for (const archetype of query.archetypes) {
        const position = World.archetypeTable(world, archetype, Position);
        const speed = World.archetypeTable(world, archetype, Speed);

        for (let i = 0; i < archetype.entities.length; i++) {
          expect(position[i].x).toBe(11);
          expect(position[i].y).toBe(21);

          expect(speed[i].value).toBe(6);
        }
      }
    });
    it('should change', () => {
      const world = World.new();

      World.registerArchetype(world, Position);
      World.registerArchetype(world, Speed);
      World.registerArchetype(world, Comments);

      const query = World.registerQuery(world, Position, Speed, Comments);

      const num = 100;

      for (let i = 0; i < num; i++) {
        const entity = World.spawnEntity(world);
        World.setComponent(world, entity, Position, { x: 10, y: 20 });
        World.setComponent(world, entity, Speed, { value: 5 });
        World.setComponent(world, entity, Comments, { value: ['hello'] });
      }

      expect(query.archetypes.length).toBe(1);

      for (const archetype of query.archetypes) {
        const position = World.archetypeTable(world, archetype, Position);
        const speed = World.archetypeTable(world, archetype, Speed);
        const comments = World.archetypeTable(world, archetype, Comments);

        expect(archetype.entities.length).toBe(num);

        for (let i = 0; i < archetype.entities.length; i++) {
          position[i].x += 1;
          position[i].y += 1;

          speed[i].value += 1;

          comments[i].value.push('world');
        }
      }

      for (const archetype of query.archetypes) {
        const position = World.archetypeTable(world, archetype, Position);
        const speed = World.archetypeTable(world, archetype, Speed);
        const comments = World.archetypeTable(world, archetype, Comments);

        for (let i = 0; i < archetype.entities.length; i++) {
          expect(position[i].x).toBe(11);
          expect(position[i].y).toBe(21);

          expect(speed[i].value).toBe(6);

          expect(comments[i].value).toEqual(['hello', 'world']);
        }
      }
    });
    it('should change', () => {
      const world = World.new();

      World.registerArchetype(world, Position);
      World.registerArchetype(world, Speed);
      World.registerArchetype(world, NamedTags);

      const query = World.registerQuery(world, Position, Speed, NamedTags);

      const num = 100;

      for (let i = 0; i < num; i++) {
        const entity = World.spawnEntity(world);
        World.setComponent(world, entity, Position, { x: 10, y: 20 });
        World.setComponent(world, entity, Speed, { value: 5 });
        World.setComponent(world, entity, NamedTags, { value: [['hello']] });
      }

      expect(query.archetypes.length).toBe(1);

      for (const archetype of query.archetypes) {
        const position = World.archetypeTable(world, archetype, Position);
        const speed = World.archetypeTable(world, archetype, Speed);
        const comments = World.archetypeTable(world, archetype, NamedTags);

        expect(archetype.entities.length).toBe(num);

        for (let i = 0; i < archetype.entities.length; i++) {
          position[i].x += 1;
          position[i].y += 1;

          speed[i].value += 1;

          comments[i].value.push(['world']);
        }
      }

      for (const archetype of query.archetypes) {
        const position = World.archetypeTable(world, archetype, Position);
        const speed = World.archetypeTable(world, archetype, Speed);
        const comments = World.archetypeTable(world, archetype, NamedTags);

        for (let i = 0; i < archetype.entities.length; i++) {
          expect(position[i].x).toBe(11);
          expect(position[i].y).toBe(21);

          expect(speed[i].value).toBe(6);

          expect(comments[i].value).toEqual([['hello'], ['world']]);
        }
      }
    });
  });
});

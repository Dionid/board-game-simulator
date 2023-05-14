import { ComponentSchema, ComponentSchemaKind, ComponentSchemaTag, World } from './index';

describe('aws', () => {
  it('should be true', () => {
    const world = World.new();

    const A: ComponentSchemaTag = {
      id: World.registerComponentSchemaId(world),
      kind: ComponentSchemaKind.Tag,
    };

    const B: ComponentSchemaTag = {
      id: World.registerComponentSchemaId(world),
      kind: ComponentSchemaKind.Tag,
    };

    const aPrefab = World.prefabricate(world, [A]);
    const bPrefab = World.prefabricate(world, [B]);

    const systemA = (world: World) => {
      const aArchetypes = World.registerQuery(world, [A] as const);

      return (world: World) => {
        for (let i = 0; i < aArchetypes.length; i++) {
          const [archetype] = aArchetypes[i];

          for (let j = 0; j < archetype.entities.length; j++) {
            World.spawnEntity(world, bPrefab);
          }
        }
      };
    };

    const systemB = (world: World) => {
      const bArchetypes = World.registerQuery(world, [B] as const);

      return (world: World) => {
        for (let i = 0; i < bArchetypes.length; i++) {
          const [archetype] = bArchetypes[i];

          for (let j = 0; j < archetype.entities.length; j++) {
            const entity = archetype.entities[j];
            World.destroyEntity(world, entity);
          }
        }
      };
    };

    for (let i = 0; i < 100; i++) {
      World.spawnEntity(world, aPrefab);
    }

    const systems = [systemA(world), systemB(world)];

    World.step(world, systems);

    expect(true).toBe(true);
  });

  it('should be true', () => {
    const world = World.new();

    const Position: ComponentSchema<{ x: number[]; y: number[] }> = {
      id: World.registerComponentSchemaId(world),
      kind: ComponentSchemaKind.SoA,
      shape: ['x', 'y'],
      default: () => {
        return {
          x: [],
          y: [],
        };
      },
    };

    const Size: ComponentSchema<{ width: number[] }> = {
      id: World.registerComponentSchemaId(world),
      kind: ComponentSchemaKind.SoA,
      shape: ['width'],
      default: () => {
        return {
          width: [],
        };
      },
    };

    const Selectable: ComponentSchemaTag = {
      id: World.registerComponentSchemaId(world),
      kind: ComponentSchemaKind.Tag,
    };

    const systemA = (world: World) => {
      const archetypes = World.registerQuery(world, [Position, Size, Selectable] as const);

      return (world: World) => {
        for (let i = 0; i < archetypes.length; i++) {
          const [archetype, [position, size]] = archetypes[i];

          for (let j = 0; j < archetype.entities.length; j++) {
            position.x[j] += 1;
            position.y[j] += 1;
            size.width[j] *= 2;
          }
        }
      };
    };

    const systems = [systemA(world)];

    World.step(world, systems);

    expect(true).toBe(true);
  });
});

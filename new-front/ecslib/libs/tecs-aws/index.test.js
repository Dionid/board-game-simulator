import { Archetype, ComponentSchemaKind, World } from './index';
describe('aws', () => {
  it.skip('should be true', () => {
    const world = World.new();
    const A = {
      id: World.registerComponentSchemaId(world),
      kind: ComponentSchemaKind.Tag,
    };
    const B = {
      id: World.registerComponentSchemaId(world),
      kind: ComponentSchemaKind.Tag,
    };
    const aPrefab = World.prefabricate(world, [A]);
    const bPrefab = World.prefabricate(world, [B]);
    const systemA = (world) => {
      const aArchetypes = World.registerQuery(world, [A]);
      return (world) => {
        for (let i = 0; i < aArchetypes.length; i++) {
          const [archetype] = aArchetypes[i];
          for (let j = archetype.entities.length - 1; j >= 0; j--) {
            World.spawnEntity(world, bPrefab);
          }
        }
      };
    };
    const systemB = (world) => {
      const bArchetypes = World.registerQuery(world, [B]);
      return (world) => {
        for (let i = 0; i < bArchetypes.length; i++) {
          const [archetype] = bArchetypes[i];
          for (let j = archetype.entities.length - 1; j >= 0; j--) {
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
    const Position = {
      id: World.registerComponentSchemaId(world),
      kind: ComponentSchemaKind.SoA,
      shape: ['x', 'y'],
      defaultValues: () => {
        return {
          x: 0,
          y: 0,
        };
      },
      default: () => {
        return {
          x: [],
          y: [],
        };
      },
    };
    const Size = {
      id: World.registerComponentSchemaId(world),
      kind: ComponentSchemaKind.SoA,
      shape: ['width'],
      defaultValues: () => {
        return {
          width: 0,
        };
      },
      default: () => {
        return {
          width: [],
        };
      },
    };
    const Selectable = {
      id: World.registerComponentSchemaId(world),
      kind: ComponentSchemaKind.Tag,
    };
    const mainPrefab = World.prefabricate(world, [Position, Size, Selectable]);
    const systemA = (world) => {
      const archetypes = World.registerQuery(world, [Position, Size, Selectable]);
      return (world) => {
        for (let i = 0; i < archetypes.length; i++) {
          const [archetype, [position, size]] = archetypes[i];
          for (let j = archetype.entities.length - 1; j >= 0; j--) {
            position.x[j] += 1;
            position.y[j] += 1;
            size.width[j] *= 2;
          }
        }
      };
    };
    for (let i = 0; i < 100; i++) {
      const entity = World.spawnEntity(world, mainPrefab);
      const arch = world.archetypesByEntities[entity];
      const size = Archetype.getComponent(arch, Size);
      size.data.width[entity] = 1;
    }
    const systems = [systemA(world)];
    World.step(world, systems);
    expect(true).toBe(true);
  });
});

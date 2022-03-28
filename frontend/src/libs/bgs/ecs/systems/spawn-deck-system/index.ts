import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { DeckComponent, SpawnDeckEventComponent, SpawnGameObjectEventComponent } from '../../components';

export const SpawnDeckEventSystem = (): System<{
  SpawnDeckEventComponent: SpawnDeckEventComponent;
  DeckComponent: DeckComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
}> => {
  return {
    run: async ({ world }) => {
      const entities = World.filter(world, ['SpawnDeckEventComponent']);
      if (entities.length === 0) {
        return;
      }

      const spawnDeckComponentPool = World.getOrAddPool(world, 'SpawnDeckEventComponent');
      const deckComponentPool = World.getOrAddPool(world, 'DeckComponent');
      const spawnGameObjectComponentPool = World.getOrAddPool(world, 'SpawnGameObjectEventComponent');

      for (const deckEntity of entities) {
        const spawnComponent = Pool.get(spawnDeckComponentPool, deckEntity);

        // TODO. Think about entity id: must be new or the same
        // . Create deck spawn event
        Pool.add(spawnGameObjectComponentPool, deckEntity, {
          id: ComponentId.new(),
          name: 'SpawnGameObjectEventComponent',
          data: {
            imageUrl: spawnComponent.data.url,
            x: 100,
            y: 100,
            width: 100,
            height: 140,
            draggable: true,
            selectable: true,
          },
        });

        Pool.add(deckComponentPool, deckEntity, {
          id: ComponentId.new(),
          name: 'DeckComponent',
          data: {
            deckId: spawnComponent.data.deckId,
          },
        });

        // Destroy event
        Pool.delete(spawnDeckComponentPool, deckEntity);
      }
    },
  };
};

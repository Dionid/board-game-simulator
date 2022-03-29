import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { CardComponent, SpawnCardEventComponent, SpawnGameObjectEventComponent } from '../../components';

export const SpawnCardEventSystem = (): System<{
  SpawnCardEventComponent: SpawnCardEventComponent;
  CardComponent: CardComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
}> => {
  return {
    run: async ({ world }) => {
      const entities = World.filter(world, ['SpawnCardEventComponent']);
      if (entities.length === 0) {
        return;
      }

      const spawnCardComponentPool = World.getOrAddPool(world, 'SpawnCardEventComponent');
      const deckComponentPool = World.getOrAddPool(world, 'CardComponent');
      const spawnGameObjectComponentPool = World.getOrAddPool(world, 'SpawnGameObjectEventComponent');

      for (const deckEntity of entities) {
        const spawnComponent = Pool.get(spawnCardComponentPool, deckEntity);

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
          name: 'CardComponent',
          data: {
            cardId: spawnComponent.data.cardId,
          },
        });

        // Destroy event
        Pool.delete(spawnCardComponentPool, deckEntity);
      }
    },
  };
};

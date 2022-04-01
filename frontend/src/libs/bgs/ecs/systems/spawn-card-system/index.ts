import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { CardComponent, SpawnCardEventComponent, SpawnGameObjectEventComponent } from '../../components';

export const SpawnCardEventSystem = (): System<{
  SpawnCardEventComponent: SpawnCardEventComponent;
  CardComponent: CardComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
}> => {
  return {
    run: async ({ essence }) => {
      const entities = Essence.filter(essence, ['SpawnCardEventComponent']);
      if (entities.length === 0) {
        return;
      }

      const spawnCardComponentPool = Essence.getOrAddPool(essence, 'SpawnCardEventComponent');
      const cardComponentPool = Essence.getOrAddPool(essence, 'CardComponent');
      const spawnGameObjectComponentPool = Essence.getOrAddPool(essence, 'SpawnGameObjectEventComponent');

      for (const cardEntity of entities) {
        const spawnComponent = Pool.get(spawnCardComponentPool, cardEntity);

        // TODO. Think about entity id: must be new or the same
        // . Create card spawn event
        Pool.add(spawnGameObjectComponentPool, cardEntity, {
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
            lockable: true,
            deletable: false,
          },
        });

        Pool.add(cardComponentPool, cardEntity, {
          id: ComponentId.new(),
          name: 'CardComponent',
          data: {
            cardId: spawnComponent.data.cardId,
          },
        });

        // Destroy event
        Pool.delete(spawnCardComponentPool, cardEntity);
      }
    },
  };
};

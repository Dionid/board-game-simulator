import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
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
        const size = {
          width: 100,
          height: 140,
        };
        Pool.add(spawnGameObjectComponentPool, cardEntity, {
          id: ComponentId.new(),
          name: 'SpawnGameObjectEventComponent',
          data: {
            imageUrl: spawnComponent.data.url,
            draggable: true,
            selectable: true,
            lockable: true,
            deletable: false,
            x: spawnComponent.data.x - size.width / 2,
            y: spawnComponent.data.y - size.height / 2,
            ...size,
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

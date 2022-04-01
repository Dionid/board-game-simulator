import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { ComponentId, Pool } from '../../../../ecs/component';
import {
  CardComponent,
  CardComponentName,
  SpawnCardEventComponent,
  SpawnCardEventComponentName,
  SpawnGameObjectEventComponent,
  SpawnGameObjectEventComponentName,
} from '../../components';

export const SpawnCardEventSystem = (): System<{
  [SpawnCardEventComponentName]: SpawnCardEventComponent;
  [CardComponentName]: CardComponent;
  [SpawnGameObjectEventComponentName]: SpawnGameObjectEventComponent;
}> => {
  return {
    run: async ({ essence }) => {
      const entities = Essence.filter(essence, [SpawnCardEventComponentName]);
      if (entities.length === 0) {
        return;
      }

      const spawnCardComponentPool = Essence.getOrAddPool(essence, SpawnCardEventComponentName);
      const cardComponentPool = Essence.getOrAddPool(essence, CardComponentName);
      const spawnGameObjectComponentPool = Essence.getOrAddPool(essence, SpawnGameObjectEventComponentName);

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
          name: SpawnGameObjectEventComponentName,
          data: {
            imageUrl: spawnComponent.data.url,
            draggable: true,
            selectable: true,
            lockable: true,
            deletable: false,
            x: spawnComponent.data.x,
            y: spawnComponent.data.y,
            ...size,
          },
        });

        Pool.add(cardComponentPool, cardEntity, {
          id: ComponentId.new(),
          name: CardComponentName,
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

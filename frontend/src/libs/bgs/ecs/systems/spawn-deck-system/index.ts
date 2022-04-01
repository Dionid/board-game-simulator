import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { ComponentId, Pool } from '../../../../ecs/component';
import {
  CameraComponent,
  CameraComponentName,
  DeckComponent,
  PlayerComponent,
  PlayerComponentName,
  PositionComponent,
  PositionComponentName,
  SizeComponent,
  SizeComponentName,
  SpawnDeckEventComponent,
  SpawnGameObjectEventComponent,
} from '../../components';
import { Size } from '../../../../math';

export const SpawnDeckEventSystem = (): System<{
  SpawnDeckEventComponent: SpawnDeckEventComponent;
  DeckComponent: DeckComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
  [CameraComponentName]: CameraComponent;
  [PlayerComponentName]: PlayerComponent;
  [PositionComponentName]: PositionComponent;
  [SizeComponentName]: SizeComponent;
}> => {
  return {
    run: async ({ essence }) => {
      const entities = Essence.filter(essence, ['SpawnDeckEventComponent']);
      if (entities.length === 0) {
        return;
      }

      const spawnDeckComponentPool = Essence.getOrAddPool(essence, 'SpawnDeckEventComponent');
      const deckComponentPool = Essence.getOrAddPool(essence, 'DeckComponent');
      const spawnGameObjectComponentPool = Essence.getOrAddPool(essence, 'SpawnGameObjectEventComponent');

      for (const deckEntity of entities) {
        const spawnComponent = Pool.get(spawnDeckComponentPool, deckEntity);

        // TODO. Think about entity id: must be new or the same
        // . Create deck spawn event
        const size: Size = {
          width: 100,
          height: 140,
        };
        Pool.add(spawnGameObjectComponentPool, deckEntity, {
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

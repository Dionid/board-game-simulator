import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import {
  CameraComponent,
  CameraComponentName,
  DeckComponent,
  PlayerComponent,
  PlayerComponentName,
  SpawnDeckEventComponent,
  SpawnGameObjectEventComponent,
} from '../../components';
import { Camera } from '../../../../game-engine';
import { Size } from '../../../../math';

export const SpawnDeckEventSystem = (): System<{
  SpawnDeckEventComponent: SpawnDeckEventComponent;
  DeckComponent: DeckComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
  [CameraComponentName]: CameraComponent;
  [PlayerComponentName]: PlayerComponent;
}> => {
  return {
    run: async ({ world }) => {
      const entities = World.filter(world, ['SpawnDeckEventComponent']);
      if (entities.length === 0) {
        return;
      }

      const playerEntities = World.filter(world, ['PlayerComponent', 'CameraComponent']);
      const cameraComponentPool = World.getOrAddPool(world, 'CameraComponent');

      // TODO. Refactor for collaboration
      const playerEntity = playerEntities[0];
      const cameraC = Pool.get(cameraComponentPool, playerEntity);

      const spawnDeckComponentPool = World.getOrAddPool(world, 'SpawnDeckEventComponent');
      const deckComponentPool = World.getOrAddPool(world, 'DeckComponent');
      const spawnGameObjectComponentPool = World.getOrAddPool(world, 'SpawnGameObjectEventComponent');

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
            ...size,
            ...Camera.inCameraView(cameraC.data, {
              x: cameraC.data.width / 2 - size.width / 2,
              y: cameraC.data.height / 2 - size.height / 2,
            }),
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

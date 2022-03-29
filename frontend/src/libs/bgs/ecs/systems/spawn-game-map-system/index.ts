import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import {
  CameraComponent,
  CameraComponentName,
  GameMapComponent,
  PlayerComponent,
  PlayerComponentName,
  SpawnGameMapComponent,
  SpawnGameObjectEventComponent,
} from '../../components';
import { Camera } from '../../../../game-engine';
import { Size } from '../../../../math';

export const SpawnGameMapSystem = (): System<{
  SpawnGameMapComponent: SpawnGameMapComponent;
  GameMapComponent: GameMapComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
  [CameraComponentName]: CameraComponent;
  [PlayerComponentName]: PlayerComponent;
}> => ({
  run: async ({ world }) => {
    const entities = World.filter(world, ['SpawnGameMapComponent']);
    if (entities.length === 0) {
      return;
    }

    const playerEntities = World.filter(world, ['PlayerComponent', 'CameraComponent']);
    const cameraComponentPool = World.getOrAddPool(world, 'CameraComponent');

    // TODO. Refactor for collaboration
    const playerEntity = playerEntities[0];
    const cameraC = Pool.get(cameraComponentPool, playerEntity);

    const spawnGameMapComponentPool = World.getOrAddPool(world, 'SpawnGameMapComponent');
    const spawnGameObjectComponentPool = World.getOrAddPool(world, 'SpawnGameObjectEventComponent');
    const gameMapComponentPool = World.getOrAddPool(world, 'GameMapComponent');

    for (const mapEntity of entities) {
      const spawnComponent = Pool.get(spawnGameMapComponentPool, mapEntity);

      // . Create react game map
      const size: Size = {
        width: 750,
        height: 500,
      };
      Pool.add(spawnGameObjectComponentPool, mapEntity, {
        id: ComponentId.new(),
        name: 'SpawnGameObjectEventComponent',
        data: {
          imageUrl: spawnComponent.data.url,
          draggable: true,
          selectable: true,
          lockable: true,
          deletable: true,
          ...size,
          ...Camera.inCameraView(cameraC.data, {
            x: cameraC.data.width / 2 - size.width / 2,
            y: cameraC.data.height / 2 - size.height / 2,
          }),
        },
      });

      Pool.add(gameMapComponentPool, mapEntity, {
        id: ComponentId.new(),
        name: 'GameMapComponent',
        data: {
          mapId: spawnComponent.data.mapId,
        },
      });

      // . Destroy event
      Pool.delete(spawnGameMapComponentPool, mapEntity);
    }
  },
});

import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { ComponentId, Pool } from '../../../../ecs/component';
import {
  CameraComponent,
  CameraComponentName,
  GameMapComponent,
  GameMapComponentName,
  HandComponent,
  HandComponentName,
  PlayerComponent,
  PlayerComponentName,
  PositionComponent,
  PositionComponentName,
  SizeComponent,
  SizeComponentName,
  SpawnGameMapEventComponent,
  SpawnGameMapEventComponentName,
  SpawnGameObjectEventComponent,
  SpawnGameObjectEventComponentName,
} from '../../components';
import { Size } from '../../../../math';

export const SpawnGameMapSystem = (): System<{
  [SpawnGameMapEventComponentName]: SpawnGameMapEventComponent;
  [GameMapComponentName]: GameMapComponent;
  [SpawnGameObjectEventComponentName]: SpawnGameObjectEventComponent;
  [CameraComponentName]: CameraComponent;
  [PlayerComponentName]: PlayerComponent;
  [PositionComponentName]: PositionComponent;
  [SizeComponentName]: SizeComponent;
  [HandComponentName]: HandComponent;
}> => ({
  run: async ({ essence }) => {
    const entities = Essence.filter(essence, [SpawnGameMapEventComponentName]);
    if (entities.length === 0) {
      return;
    }

    const spawnGameMapComponentPool = Essence.getOrAddPool(essence, SpawnGameMapEventComponentName);

    const spawnGameObjectComponentPool = Essence.getOrAddPool(essence, SpawnGameObjectEventComponentName);
    const gameMapComponentPool = Essence.getOrAddPool(essence, GameMapComponentName);

    const playerCameraEntityId = Essence.filter(essence, [PlayerComponentName, CameraComponentName])[0];
    const positionCP = Essence.getOrAddPool(essence, PositionComponentName);
    const cameraPositionC = Pool.get(positionCP, playerCameraEntityId);

    for (const mapEntity of entities) {
      const spawnComponent = Pool.get(spawnGameMapComponentPool, mapEntity);

      // . Create react game map
      const size: Size = {
        width: 750,
        height: 500,
      };

      const x = spawnComponent.data.x + cameraPositionC.data.x - size.width / 2;
      const y = spawnComponent.data.y + cameraPositionC.data.y - size.height / 2;

      Pool.add(spawnGameObjectComponentPool, mapEntity, {
        id: ComponentId.new(),
        name: SpawnGameObjectEventComponentName,
        data: {
          imageUrl: spawnComponent.data.url,
          draggable: true,
          selectable: true,
          lockable: true,
          deletable: true,
          dynamicDepth: true,
          x,
          y,
          ...size,
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

import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { ComponentId, Pool } from '../../../../ecs/component';
import {
  CameraComponent,
  CameraComponentName,
  GameMapComponent,
  GameMapComponentName,
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
import { Size, Vector2 } from '../../../../math';

export const SpawnGameMapSystem = (): System<{
  [SpawnGameMapEventComponentName]: SpawnGameMapEventComponent;
  GameMapComponent: GameMapComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
  [CameraComponentName]: CameraComponent;
  [PlayerComponentName]: PlayerComponent;
  [PositionComponentName]: PositionComponent;
  [SizeComponentName]: SizeComponent;
}> => ({
  run: async ({ essence }) => {
    const entities = Essence.filter(essence, [SpawnGameMapEventComponentName]);
    if (entities.length === 0) {
      return;
    }

    const playerEntities = Essence.filter(essence, [PlayerComponentName, CameraComponentName]);
    const cameraPositionComponentPool = Essence.getOrAddPool(essence, PositionComponentName);
    const cameraSizeComponentPool = Essence.getOrAddPool(essence, SizeComponentName);

    // TODO. Refactor for collaboration
    const playerEntity = playerEntities[0];
    const cameraPositionC = Pool.get(cameraPositionComponentPool, playerEntity);
    const cameraSizeC = Pool.get(cameraSizeComponentPool, playerEntity);

    const spawnGameMapComponentPool = Essence.getOrAddPool(essence, SpawnGameMapEventComponentName);
    const spawnGameObjectComponentPool = Essence.getOrAddPool(essence, SpawnGameObjectEventComponentName);
    const gameMapComponentPool = Essence.getOrAddPool(essence, GameMapComponentName);

    for (const mapEntity of entities) {
      const spawnComponent = Pool.get(spawnGameMapComponentPool, mapEntity);

      // . Create react game map
      const size: Size = {
        width: 750,
        height: 500,
      };
      Pool.add(spawnGameObjectComponentPool, mapEntity, {
        id: ComponentId.new(),
        name: SpawnGameObjectEventComponentName,
        data: {
          imageUrl: spawnComponent.data.url,
          draggable: true,
          selectable: true,
          lockable: true,
          deletable: true,
          ...size,
          ...Vector2.sum(cameraPositionC.data, {
            x: cameraSizeC.data.width / 2 - size.width / 2,
            y: cameraSizeC.data.height / 2 - size.height / 2,
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

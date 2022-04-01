import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { ComponentId, Pool } from '../../../../ecs/component';
import {
  CameraComponent,
  CameraComponentName,
  GameMapComponent,
  PlayerComponent,
  PlayerComponentName,
  PositionComponent,
  PositionComponentName,
  SizeComponent,
  SizeComponentName,
  SpawnGameMapComponent,
  SpawnGameObjectEventComponent,
} from '../../components';
import { Size, Vector2 } from '../../../../math';

export const SpawnGameMapSystem = (): System<{
  SpawnGameMapComponent: SpawnGameMapComponent;
  GameMapComponent: GameMapComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
  [CameraComponentName]: CameraComponent;
  [PlayerComponentName]: PlayerComponent;
  [PositionComponentName]: PositionComponent;
  [SizeComponentName]: SizeComponent;
}> => ({
  run: async ({ essence }) => {
    const entities = Essence.filter(essence, ['SpawnGameMapComponent']);
    if (entities.length === 0) {
      return;
    }

    const playerEntities = Essence.filter(essence, ['PlayerComponent', 'CameraComponent']);
    const cameraPositionComponentPool = Essence.getOrAddPool(essence, 'PositionComponent');
    const cameraSizeComponentPool = Essence.getOrAddPool(essence, 'SizeComponent');

    // TODO. Refactor for collaboration
    const playerEntity = playerEntities[0];
    const cameraPositionC = Pool.get(cameraPositionComponentPool, playerEntity);
    const cameraSizeC = Pool.get(cameraSizeComponentPool, playerEntity);

    const spawnGameMapComponentPool = Essence.getOrAddPool(essence, 'SpawnGameMapComponent');
    const spawnGameObjectComponentPool = Essence.getOrAddPool(essence, 'SpawnGameObjectEventComponent');
    const gameMapComponentPool = Essence.getOrAddPool(essence, 'GameMapComponent');

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

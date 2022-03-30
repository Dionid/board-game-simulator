import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import {
  RuleCardComponent,
  SpawnRuleCardEventComponent,
  SpawnGameObjectEventComponent,
  CameraComponentName,
  CameraComponent,
  PlayerComponentName,
  PlayerComponent,
  PositionComponentName,
  PositionComponent,
  SizeComponentName,
  SizeComponent,
} from '../../components';
import { Vector2 } from '../../../../math';

export const SpawnRuleCardEventSystem = (): System<{
  SpawnRuleCardEventComponent: SpawnRuleCardEventComponent;
  RuleCardComponent: RuleCardComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
  [CameraComponentName]: CameraComponent;
  [PlayerComponentName]: PlayerComponent;
  [PositionComponentName]: PositionComponent;
  [SizeComponentName]: SizeComponent;
}> => {
  return {
    run: async ({ world }) => {
      const entities = World.filter(world, ['SpawnRuleCardEventComponent']);
      if (entities.length === 0) {
        return;
      }

      const playerEntities = World.filter(world, ['PlayerComponent', 'CameraComponent']);
      const cameraPositionComponentPool = World.getOrAddPool(world, 'PositionComponent');
      const cameraSizeComponentPool = World.getOrAddPool(world, 'SizeComponent');

      // TODO. Refactor for collaboration
      const playerEntity = playerEntities[0];
      const cameraPositionC = Pool.get(cameraPositionComponentPool, playerEntity);
      const cameraSizeC = Pool.get(cameraSizeComponentPool, playerEntity);

      const spawnRuleCardComponentPool = World.getOrAddPool(world, 'SpawnRuleCardEventComponent');
      const ruleCardComponentPool = World.getOrAddPool(world, 'RuleCardComponent');
      const spawnGameObjectComponentPool = World.getOrAddPool(world, 'SpawnGameObjectEventComponent');

      for (const ruleCardEntity of entities) {
        const spawnComponent = Pool.get(spawnRuleCardComponentPool, ruleCardEntity);

        // TODO. Think about entity id: must be new or the same
        // . Create ruleCard spawn event
        const size = {
          width: 100,
          height: 140,
        };
        Pool.add(spawnGameObjectComponentPool, ruleCardEntity, {
          id: ComponentId.new(),
          name: 'SpawnGameObjectEventComponent',
          data: {
            imageUrl: spawnComponent.data.url,
            draggable: true,
            selectable: true,
            lockable: true,
            deletable: false,
            ...size,
            ...Vector2.sum(cameraPositionC.data, {
              x: cameraSizeC.data.width / 2 - size.width / 2,
              y: cameraSizeC.data.height / 2 - size.height / 2,
            }),
          },
        });

        Pool.add(ruleCardComponentPool, ruleCardEntity, {
          id: ComponentId.new(),
          name: 'RuleCardComponent',
          data: {
            ruleCardId: spawnComponent.data.ruleCardId,
          },
        });

        // Destroy event
        Pool.delete(spawnRuleCardComponentPool, ruleCardEntity);
      }
    },
  };
};

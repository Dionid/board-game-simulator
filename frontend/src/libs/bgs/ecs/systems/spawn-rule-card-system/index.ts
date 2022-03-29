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
} from '../../components';
import { Camera } from '../../../../game-engine';

export const SpawnRuleCardEventSystem = (): System<{
  SpawnRuleCardEventComponent: SpawnRuleCardEventComponent;
  RuleCardComponent: RuleCardComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
  [CameraComponentName]: CameraComponent;
  [PlayerComponentName]: PlayerComponent;
}> => {
  return {
    run: async ({ world }) => {
      const entities = World.filter(world, ['SpawnRuleCardEventComponent']);
      if (entities.length === 0) {
        return;
      }

      const playerEntities = World.filter(world, ['PlayerComponent', 'CameraComponent']);
      const cameraComponentPool = World.getOrAddPool(world, 'CameraComponent');

      // TODO. Refactor for collaboration
      const playerEntity = playerEntities[0];
      const cameraC = Pool.get(cameraComponentPool, playerEntity);

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
            ...Camera.inCameraView(cameraC.data, {
              x: cameraC.data.width / 2 - size.width / 2,
              y: cameraC.data.height / 2 - size.height / 2,
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

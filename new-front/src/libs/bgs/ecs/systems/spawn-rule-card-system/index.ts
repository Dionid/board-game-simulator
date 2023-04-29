import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
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
  SpawnRuleCardEventComponentName,
  RuleCardComponentName,
  SpawnGameObjectEventComponentName,
} from '../../components';

export const SpawnRuleCardEventSystem = (): System<{
  [SpawnRuleCardEventComponentName]: SpawnRuleCardEventComponent;
  [RuleCardComponentName]: RuleCardComponent;
  [SpawnGameObjectEventComponentName]: SpawnGameObjectEventComponent;
  [CameraComponentName]: CameraComponent;
  [PlayerComponentName]: PlayerComponent;
  [PositionComponentName]: PositionComponent;
  [SizeComponentName]: SizeComponent;
}> => {
  return {
    run: async ({ essence }) => {
      const entities = Essence.getEntitiesByComponents(essence, [SpawnRuleCardEventComponentName]);
      if (entities.length === 0) {
        return;
      }

      const spawnRuleCardComponentPool = Essence.getOrAddPool(essence, SpawnRuleCardEventComponentName);
      const ruleCardComponentPool = Essence.getOrAddPool(essence, RuleCardComponentName);
      const spawnGameObjectComponentPool = Essence.getOrAddPool(essence, SpawnGameObjectEventComponentName);

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
          name: SpawnGameObjectEventComponentName,
          data: {
            imageUrl: spawnComponent.data.url,
            draggable: true,
            selectable: true,
            lockable: true,
            deletable: false,
            dynamicDepth: true,
            x: spawnComponent.data.x - size.width / 2,
            y: spawnComponent.data.y - size.height / 2,
            ...size,
          },
        });

        Pool.add(ruleCardComponentPool, ruleCardEntity, {
          id: ComponentId.new(),
          name: RuleCardComponentName,
          data: {
            heroSetEntityId: spawnComponent.data.heroSetEntityId,
            ruleCardId: spawnComponent.data.ruleCardId,
          },
        });

        // Destroy event
        Pool.delete(spawnRuleCardComponentPool, ruleCardEntity);
      }
    },
  };
};

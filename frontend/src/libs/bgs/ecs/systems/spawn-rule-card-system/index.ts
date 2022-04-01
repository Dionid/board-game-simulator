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
} from '../../components';

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
    run: async ({ essence }) => {
      const entities = Essence.filter(essence, ['SpawnRuleCardEventComponent']);
      if (entities.length === 0) {
        return;
      }

      const spawnRuleCardComponentPool = Essence.getOrAddPool(essence, 'SpawnRuleCardEventComponent');
      const ruleCardComponentPool = Essence.getOrAddPool(essence, 'RuleCardComponent');
      const spawnGameObjectComponentPool = Essence.getOrAddPool(essence, 'SpawnGameObjectEventComponent');

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
            x: spawnComponent.data.x - size.width / 2,
            y: spawnComponent.data.y - size.height / 2,
            ...size,
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

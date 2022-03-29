import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { RuleCardComponent, SpawnRuleCardEventComponent, SpawnGameObjectEventComponent } from '../../components';

export const SpawnRuleCardEventSystem = (): System<{
  SpawnRuleCardEventComponent: SpawnRuleCardEventComponent;
  RuleCardComponent: RuleCardComponent;
  SpawnGameObjectEventComponent: SpawnGameObjectEventComponent;
}> => {
  return {
    run: async ({ world }) => {
      const entities = World.filter(world, ['SpawnRuleCardEventComponent']);
      if (entities.length === 0) {
        return;
      }

      const spawnRuleCardComponentPool = World.getOrAddPool(world, 'SpawnRuleCardEventComponent');
      const ruleCardComponentPool = World.getOrAddPool(world, 'RuleCardComponent');
      const spawnGameObjectComponentPool = World.getOrAddPool(world, 'SpawnGameObjectEventComponent');

      for (const ruleCardEntity of entities) {
        const spawnComponent = Pool.get(spawnRuleCardComponentPool, ruleCardEntity);

        // TODO. Think about entity id: must be new or the same
        // . Create ruleCard spawn event
        Pool.add(spawnGameObjectComponentPool, ruleCardEntity, {
          id: ComponentId.new(),
          name: 'SpawnGameObjectEventComponent',
          data: {
            imageUrl: spawnComponent.data.url,
            x: 100,
            y: 100,
            width: 100,
            height: 140,
            draggable: true,
            selectable: true,
            lockable: true,
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

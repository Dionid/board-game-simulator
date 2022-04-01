import { System } from '../../../../ecs/system';
import { OwnerComponent, PlayerComponent } from '../../components';
import { Essence } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import { UUID } from '../../../../branded-types';

export const PlayerSystem = (): System<{
  PlayerComponent: PlayerComponent;
  OwnerComponent: OwnerComponent;
}> => {
  return {
    init: async ({ essence }) => {
      console.log('PlayerSystem init');
      const playerEntity = EntityId.new();

      const playerPool = Essence.getOrAddPool(essence, 'PlayerComponent');
      Pool.add(playerPool, playerEntity, {
        id: ComponentId.new(),
        name: 'PlayerComponent',
        data: {
          id: UUID.new(),
        },
      });

      const ownerPool = Essence.getOrAddPool(essence, 'OwnerComponent');
      Pool.add(ownerPool, playerEntity, {
        id: ComponentId.new(),
        name: 'OwnerComponent',
        data: {},
      });
    },
    run: async ({ essence }) => {},
  };
};

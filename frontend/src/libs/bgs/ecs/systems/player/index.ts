import { System } from '../../../../ecs/system';
import { OwnerComponent, PlayerComponent } from '../../components';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import { UUID } from '../../../../branded-types';

export const PlayerSystem = (): System<{
  PlayerComponent: PlayerComponent;
  OwnerComponent: OwnerComponent;
}> => {
  return {
    init: async ({ world }) => {
      const playerEntity = EntityId.new();

      const playerPool = World.getOrAddPool(world, 'PlayerComponent');
      Pool.add(playerPool, playerEntity, {
        id: ComponentId.new(),
        name: 'PlayerComponent',
        data: {
          id: UUID.new(),
        },
      });

      const ownerPool = World.getOrAddPool(world, 'OwnerComponent');
      Pool.add(ownerPool, playerEntity, {
        id: ComponentId.new(),
        name: 'OwnerComponent',
        data: {},
      });
    },
    run: async ({ world }) => {},
  };
};

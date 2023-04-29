import { System } from '../../../../ecs/system';
import { OwnerComponent, PlayerComponent } from '../../components';
import { Essence } from '../../../../ecs/essence';
import { ComponentId, Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';

export const PlayerSystem = (): System<
  {
    PlayerComponent: PlayerComponent;
    OwnerComponent: OwnerComponent;
  },
  {
    playerId: string;
  }
> => {
  return {
    init: async ({ essence, ctx }) => {
      const playerEntity = EntityId.new();

      const playerPool = Essence.getOrAddPool(essence, 'PlayerComponent');
      Pool.add(playerPool, playerEntity, {
        id: ComponentId.new(),
        name: 'PlayerComponent',
        data: {
          id: ctx.playerId,
        },
      });

      const ownerPool = Essence.getOrAddPool(essence, 'OwnerComponent');
      Pool.add(ownerPool, playerEntity, {
        id: ComponentId.new(),
        name: 'OwnerComponent',
        data: {},
      });
    },
  };
};

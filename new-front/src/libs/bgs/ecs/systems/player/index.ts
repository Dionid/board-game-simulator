import { System } from '../../../../ecs/system';
import { OwnerComponent, PlayerComponent } from '../../components';
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import { UUID } from '../../../../branded-types';

export const PlayerSystem = (): System<{
  playerId: UUID;
}> => {
  return {
    init: async ({ essence, ctx }) => {
      // const playerEntity = EntityId.new();

      const playerPool = Essence.getOrAddPool(essence, PlayerComponent);
      Pool.add(
        playerPool,
        EntityId.ofString(ctx.playerId),
        PlayerComponent.new({
          id: ctx.playerId,
        })
      );

      const ownerPool = Essence.getOrAddPool(essence, OwnerComponent);
      Pool.add(
        ownerPool,
        EntityId.ofString(ctx.playerId),
        OwnerComponent.new({
          playerId: ctx.playerId,
        })
      );
    },
  };
};

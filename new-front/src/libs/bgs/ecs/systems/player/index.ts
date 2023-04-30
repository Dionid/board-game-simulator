import { System } from '../../../../ecs/system';
import { OwnerComponent, PlayerComponent } from '../../components';
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';

export const PlayerSystem = (): System<{
  playerEntity: EntityId;
}> => {
  return {
    init: async ({ essence, ctx: { playerEntity } }) => {
      console.log('PlayerSystem', playerEntity);

      const playerPool = Essence.getOrAddPool(essence, PlayerComponent);
      Pool.add(
        playerPool,
        playerEntity,
        PlayerComponent.new({
          id: playerEntity,
        })
      );

      const ownerPool = Essence.getOrAddPool(essence, OwnerComponent);
      Pool.add(
        ownerPool,
        EntityId.ofString(playerEntity),
        OwnerComponent.new({
          playerId: playerEntity,
        })
      );
    },
  };
};

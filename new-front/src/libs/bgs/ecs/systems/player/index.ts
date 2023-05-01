import { System } from '../../../../ecs/system';
import { OwnerComponent, PlayerComponent } from '../../components';
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import { useIsInitial } from '../../../../ecs/hooks/use-init';

export const PlayerSystem = (): System<{
  playerEntity: EntityId;
}> => {
  return {
    run: ({ essence, ctx }) => {
      const { playerEntity } = ctx();
      const isInitial = useIsInitial();

      if (!isInitial) {
        return;
      }

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

import { System } from '../../../../ecs/system';
import { OwnerComponent, PlayerComponent } from '../../components';
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import { useIsInitial } from '../../../../ecs/hooks/use-init';

export const PlayerSystem = (): System<{
  playerEntity: EntityId;
}> => {
  return ({ essence, ctx }) => {
    const isInitial = useIsInitial();

    if (!isInitial) {
      return;
    }

    const { playerEntity } = ctx();

    console.log('PlayerSystem', playerEntity);

    const playerCP = Essence.getOrAddPool(essence, PlayerComponent);
    Pool.add(
      playerCP,
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
  };
};

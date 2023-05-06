import { OwnerComponent, PlayerComponent } from '../../components';
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import { useIsInitial } from '../../../../ecs/hooks/use-init';
export var PlayerSystem = function () {
  return function (_a) {
    var essence = _a.essence,
      ctx = _a.ctx;
    var isInitial = useIsInitial();
    if (!isInitial) {
      return;
    }
    var playerEntity = ctx().playerEntity;
    console.log('PlayerSystem', playerEntity);
    var playerCP = Essence.getOrAddPool(essence, PlayerComponent);
    Pool.add(
      playerCP,
      playerEntity,
      PlayerComponent.new({
        id: playerEntity,
      })
    );
    var ownerPool = Essence.getOrAddPool(essence, OwnerComponent);
    Pool.add(
      ownerPool,
      EntityId.ofString(playerEntity),
      OwnerComponent.new({
        playerId: playerEntity,
      })
    );
  };
};

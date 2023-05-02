import { Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import { Essence } from '../../../../ecs/essence';
import { useIsInitial } from '../../../../ecs/hooks/use-init';
import { System } from '../../../../ecs/system';
import { DepthComponent } from '../../components';

export const DepthSystem = (): System<{ playerEntity: EntityId }> => {
  return ({ essence, ctx }) => {
    const isInitial = useIsInitial();

    if (!isInitial) {
      return;
    }

    const { playerEntity } = ctx();
    Pool.add(
      Essence.getOrAddPool(essence, DepthComponent),
      playerEntity,
      DepthComponent.new({
        highest: 0,
      })
    );
  };
};

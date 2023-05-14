import { Pool } from '../../../../ecs/component';
import { Essence } from '../../../../ecs/essence';
import { useIsInitial } from '../../../../ecs/hooks/use-init';
import { DepthComponent } from '../../components';
export const DepthSystem = () => {
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

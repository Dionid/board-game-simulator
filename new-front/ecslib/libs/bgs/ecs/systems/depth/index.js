import { Pool } from '../../../../ecs/component';
import { Essence } from '../../../../ecs/essence';
import { useIsInitial } from '../../../../ecs/hooks/use-init';
import { DepthComponent } from '../../components';
export var DepthSystem = function () {
  return function (_a) {
    var essence = _a.essence,
      ctx = _a.ctx;
    var isInitial = useIsInitial();
    if (!isInitial) {
      return;
    }
    var playerEntity = ctx().playerEntity;
    Pool.add(
      Essence.getOrAddPool(essence, DepthComponent),
      playerEntity,
      DepthComponent.new({
        highest: 0,
      })
    );
  };
};

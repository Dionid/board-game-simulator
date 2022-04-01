import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import { ScaleComponent, ReactScaleComponent, ScaleComponentName, ReactScaleComponentName } from '../../components';

export const ChangeReactScaleSystem = (): System<{
  [ReactScaleComponentName]: ReactScaleComponent;
  [ScaleComponentName]: ScaleComponent;
}> => ({
  run: async ({ essence }) => {
    const entities = Essence.filter(essence, [ReactScaleComponentName, ScaleComponentName]);
    if (entities.length === 0) {
      return;
    }

    const scalePool = Essence.getOrAddPool(essence, ScaleComponentName);
    const reactScalePool = Essence.getOrAddPool(essence, ReactScaleComponentName);

    entities.forEach((entity) => {
      const scaleComponent = Pool.get(scalePool, entity);
      const reactScaleComponent = Pool.get(reactScalePool, entity);
      if (
        reactScaleComponent.data.state.x !== scaleComponent.data.x ||
        reactScaleComponent.data.state.y !== scaleComponent.data.y
      ) {
        reactScaleComponent.data.setState({ x: scaleComponent.data.x, y: scaleComponent.data.y });
      }
    });
  },
});

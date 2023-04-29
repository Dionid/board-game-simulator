import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import {
  HealthMeterComponent,
  HealthMeterComponentName,
  ReactHealthMeterComponent,
  ReactHealthMeterComponentName,
} from '../../components';

export const ChangeReactHealthMeter = (): System<{
  [ReactHealthMeterComponentName]: ReactHealthMeterComponent;
  [HealthMeterComponentName]: HealthMeterComponent;
}> => ({
  run: async ({ essence }) => {
    const entities = Essence.filter(essence, [ReactHealthMeterComponentName, HealthMeterComponentName]);
    if (entities.length === 0) {
      return;
    }

    const healthMeterPool = Essence.getOrAddPool(essence, HealthMeterComponentName);
    const reactImagePool = Essence.getOrAddPool(essence, ReactHealthMeterComponentName);

    entities.forEach((entity) => {
      const healthMeterComponent = Pool.get(healthMeterPool, entity);
      const reactImageComponent = Pool.get(reactImagePool, entity);
      if (healthMeterComponent.data.currentHealth !== reactImageComponent.data.state.current) {
        reactImageComponent.data.setState({ current: healthMeterComponent.data.currentHealth });
      }
    });
  },
});

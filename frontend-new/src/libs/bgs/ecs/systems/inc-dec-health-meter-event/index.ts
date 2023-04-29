import { Essence } from '../../../../ecs/essence';
import { System } from '../../../../ecs/system';
import {
  DecrementCurrentHealthEventComponent,
  DecrementCurrentHealthEventComponentName,
  HealthMeterComponent,
  HealthMeterComponentName,
  IncrementCurrentHealthEventComponent,
  IncrementCurrentHealthEventComponentName,
} from '../../components';
import { Pool } from '../../../../ecs/component';

export const IncDecHealthMeterEvent = (): System<
  {
    [HealthMeterComponentName]: HealthMeterComponent;
    [DecrementCurrentHealthEventComponentName]: DecrementCurrentHealthEventComponent;
    [IncrementCurrentHealthEventComponentName]: IncrementCurrentHealthEventComponent;
  },
  {
    forceUpdate: () => void;
  }
> => {
  return {
    run: async ({ essence, ctx }) => {
      const incEntities = Essence.filter(essence, [IncrementCurrentHealthEventComponentName]);
      const decEntities = Essence.filter(essence, [DecrementCurrentHealthEventComponentName]);

      if (incEntities.length === 0 && decEntities.length === 0) {
        return;
      }

      const incCP = Essence.getOrAddPool(essence, IncrementCurrentHealthEventComponentName);
      const decCP = Essence.getOrAddPool(essence, DecrementCurrentHealthEventComponentName);
      const healthMeterCP = Essence.getOrAddPool(essence, HealthMeterComponentName);

      incEntities.forEach((entity) => {
        const incC = Pool.get(incCP, entity);
        const healthMeterC = Pool.get(healthMeterCP, incC.data.healthMeterEntityId);

        if (healthMeterC.data.currentHealth < healthMeterC.data.maxHealth) {
          healthMeterC.data.currentHealth += 1;
        }

        Essence.destroyEntity(essence, entity);
      });

      decEntities.forEach((entity) => {
        const decC = Pool.get(decCP, entity);
        const healthMeterC = Pool.get(healthMeterCP, decC.data.healthMeterEntityId);

        if (healthMeterC.data.currentHealth > 0) {
          healthMeterC.data.currentHealth -= 1;
        }

        Essence.destroyEntity(essence, entity);
      });

      ctx.forceUpdate();
    },
  };
};

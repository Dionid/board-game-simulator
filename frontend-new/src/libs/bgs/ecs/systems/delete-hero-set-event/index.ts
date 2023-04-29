import {
  DeleteHeroSetEventComponent,
  DeleteHeroSetEventComponentName,
  HeroSetComponent,
  HeroSetComponentName,
} from '../../components';
import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';

export const DeleteHeroEventSet = (): System<
  {
    [DeleteHeroSetEventComponentName]: DeleteHeroSetEventComponent;
    [HeroSetComponentName]: HeroSetComponent;
  },
  {
    forceUpdate: () => void;
  }
> => {
  return {
    run: async ({ essence, ctx }) => {
      const entities = Essence.filter(essence, [DeleteHeroSetEventComponentName]);

      if (entities.length === 0) {
        return;
      }

      const deleteHeroSetEventCP = Essence.getOrAddPool(essence, DeleteHeroSetEventComponentName);
      const heroSetCP = Essence.getOrAddPool(essence, HeroSetComponentName);

      entities.forEach((entity) => {
        const deleteHeroSetEventC = Pool.get(deleteHeroSetEventCP, entity);
        const heroSetC = Pool.get(heroSetCP, deleteHeroSetEventC.data.setEntityId);

        heroSetC.data.boundedEntityIds.forEach((boundedEntity) => {
          Essence.destroyEntity(essence, boundedEntity);
        });

        Essence.destroyEntity(essence, deleteHeroSetEventC.data.setEntityId);
        Essence.destroyEntity(essence, entity);
      });

      ctx.forceUpdate();
    },
  };
};

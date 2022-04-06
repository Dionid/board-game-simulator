import { Pool } from '../../../../ecs/component';
import { Essence } from '../../../../ecs/essence';
import { System } from '../../../../ecs/system';
import {
  ChangeViewEventComponent,
  ChangeViewEventComponentName,
  ImageComponent,
  ImageComponentName,
  ViewChangeableComponent,
  ViewChangeableComponentName,
} from '../../components';

export const ChangeView = (): System<{
  [ChangeViewEventComponentName]: ChangeViewEventComponent;
  [ViewChangeableComponentName]: ViewChangeableComponent;
  [ImageComponentName]: ImageComponent;
}> => {
  return {
    run: async ({ essence }) => {
      const entities = Essence.filter(essence, [ChangeViewEventComponentName]);

      if (entities.length === 0) {
        return;
      }

      const changeViewEventCP = Essence.getOrAddPool(essence, ChangeViewEventComponentName);
      const viewChangeableCP = Essence.getOrAddPool(essence, ViewChangeableComponentName);
      const imageCP = Essence.getOrAddPool(essence, ImageComponentName);

      entities.forEach((entity) => {
        const changeViewEventC = Pool.get(changeViewEventCP, entity);
        const viewChangeableC = Pool.get(viewChangeableCP, changeViewEventC.data.entityId);
        const imageC = Pool.get(imageCP, changeViewEventC.data.entityId);

        const { current, views } = viewChangeableC.data;

        if (current === views.length - 1) {
          viewChangeableC.data.current = 0;
        } else {
          viewChangeableC.data.current += 1;
        }

        imageC.data.url = viewChangeableC.data.views[viewChangeableC.data.current].url;

        Essence.destroyEntity(essence, entity);
      });
    },
  };
};

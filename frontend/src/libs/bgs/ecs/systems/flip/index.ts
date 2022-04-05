import { Pool } from '../../../../ecs/component';
import { Essence } from '../../../../ecs/essence';
import { System } from '../../../../ecs/system';
import {
  FlipEventComponent,
  FlipEventComponentName,
  FlippableComponent,
  FlippableComponentName,
  ImageComponent,
  ImageComponentName,
} from '../../components';
import { Switch } from '../../../../switch';

export const Flip = (): System<{
  [FlipEventComponentName]: FlipEventComponent;
  [FlippableComponentName]: FlippableComponent;
  [ImageComponentName]: ImageComponent;
}> => {
  return {
    run: async ({ essence }) => {
      const entities = Essence.filter(essence, [FlipEventComponentName]);

      if (entities.length === 0) {
        return;
      }

      const flipCP = Essence.getOrAddPool(essence, FlipEventComponentName);
      const flippableCP = Essence.getOrAddPool(essence, FlippableComponentName);
      const imageCP = Essence.getOrAddPool(essence, ImageComponentName);

      entities.forEach((entity) => {
        const flipC = Pool.get(flipCP, entity);
        const flippableC = Pool.get(flippableCP, flipC.data.entityId);
        const imageC = Pool.get(imageCP, flipC.data.entityId);

        const { currentSide } = flippableC.data;

        switch (currentSide) {
          case 'front':
            flippableC.data.currentSide = 'back';
            break;
          case 'back':
            flippableC.data.currentSide = 'front';
            break;
          default:
            Switch.safeGuard(currentSide);
        }

        imageC.data.url = flippableC.data[flippableC.data.currentSide].url;

        Essence.destroyEntity(essence, entity);
      });
    },
  };
};

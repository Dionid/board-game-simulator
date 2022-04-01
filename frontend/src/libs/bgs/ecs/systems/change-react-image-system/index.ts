import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import { ImageComponent, ReactImageComponent } from '../../components';

export const ChangeReactImageSystem = (): System<{
  ReactImageComponent: ReactImageComponent;
  ImageComponent: ImageComponent;
}> => ({
  run: async ({ essence }) => {
    const entities = Essence.filter(essence, ['ReactImageComponent', 'ImageComponent']);
    if (entities.length === 0) {
      return;
    }

    const imagePool = Essence.getOrAddPool(essence, 'ImageComponent');
    const reactImagePool = Essence.getOrAddPool(essence, 'ReactImageComponent');

    entities.forEach((entity) => {
      const imageComponent = Pool.get(imagePool, entity);
      const reactImageComponent = Pool.get(reactImagePool, entity);
      if (imageComponent.data.url !== reactImageComponent.data.state.url) {
        reactImageComponent.data.setState({ url: imageComponent.data.url });
      }
    });
  },
});

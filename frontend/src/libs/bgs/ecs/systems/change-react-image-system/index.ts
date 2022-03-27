import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { Pool } from '../../../../ecs/component';
import { ImageComponent, ReactImageComponent } from '../../components';

export const ChangeReactImageSystem = (): System<{
  ReactImageComponent: ReactImageComponent;
  ImageComponent: ImageComponent;
}> => ({
  run: async (world) => {
    const entities = World.filter(world, ['ReactImageComponent', 'ImageComponent']);
    if (entities.length === 0) {
      return;
    }

    const imagePool = World.getOrAddPool(world, 'ImageComponent');
    const reactImagePool = World.getOrAddPool(world, 'ReactImageComponent');

    entities.forEach((entity) => {
      const imageComponent = Pool.get(imagePool, entity);
      const reactImageComponent = Pool.get(reactImagePool, entity);
      if (imageComponent.data.url !== reactImageComponent.data.state.url) {
        console.log('Not identical imageComponent');
        reactImageComponent.data.setState({ url: imageComponent.data.url });
      }
    });
  },
});

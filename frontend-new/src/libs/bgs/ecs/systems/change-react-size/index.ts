import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import { ReactSizeComponent, SizeComponent } from '../../components';

export const ChangeReactSizeSystem = (): System<{
  ReactSizeComponent: ReactSizeComponent;
  SizeComponent: SizeComponent;
}> => ({
  run: async ({ essence }) => {
    const entities = Essence.filter(essence, ['ReactSizeComponent', 'SizeComponent']);
    if (entities.length === 0) {
      return;
    }

    const sizePool = Essence.getOrAddPool(essence, 'SizeComponent');
    const reactSizePool = Essence.getOrAddPool(essence, 'ReactSizeComponent');

    entities.forEach((entity) => {
      const sizeComponent = Pool.get(sizePool, entity);
      const reactSizeComponent = Pool.get(reactSizePool, entity);
      if (
        reactSizeComponent.data.state.width !== sizeComponent.data.width ||
        reactSizeComponent.data.state.height !== sizeComponent.data.height
      ) {
        reactSizeComponent.data.setState({ width: sizeComponent.data.width, height: sizeComponent.data.height });
      }
    });
  },
});

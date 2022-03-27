import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { Pool } from '../../../../ecs/component';
import { ReactSizeComponent, SizeComponent } from '../../components';

export const ChangeReactSizeSystem = (): System<{
  ReactSizeComponent: ReactSizeComponent;
  SizeComponent: SizeComponent;
}> => ({
  run: async (world) => {
    const entities = World.filter(world, ['ReactSizeComponent', 'SizeComponent']);
    if (entities.length === 0) {
      return;
    }

    const sizePool = World.getOrAddPool(world, 'SizeComponent');
    const reactSizePool = World.getOrAddPool(world, 'ReactSizeComponent');

    entities.forEach((entity) => {
      const sizeComponent = Pool.get(sizePool, entity);
      const reactSizeComponent = Pool.get(reactSizePool, entity);
      if (
        reactSizeComponent.data.state.width !== sizeComponent.data.width ||
        reactSizeComponent.data.state.height !== sizeComponent.data.height
      ) {
        console.log('Not identical reactSizeComponent');
        reactSizeComponent.data.setState({ width: sizeComponent.data.width, height: sizeComponent.data.height });
      }
    });
  },
});

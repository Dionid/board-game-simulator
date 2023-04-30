import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import { SizeComponent } from '../../components';
import { ReactSizeComponent } from '../../../../ecs/react/components';

export const ChangeReactSizeSystem = (): System => ({
  run: async ({ essence }) => {
    const entities = Essence.getEntitiesByComponents(essence, [ReactSizeComponent, SizeComponent]);
    if (entities.length === 0) {
      return;
    }

    const sizePool = Essence.getOrAddPool(essence, SizeComponent);
    const reactSizePool = Essence.getOrAddPool(essence, ReactSizeComponent);

    entities.forEach((entity) => {
      const sizeComponent = Pool.get(sizePool, entity);
      const reactSizeComponent = Pool.get(reactSizePool, entity);
      if (
        reactSizeComponent.props.state.width !== sizeComponent.props.width ||
        reactSizeComponent.props.state.height !== sizeComponent.props.height
      ) {
        reactSizeComponent.props.setState({ width: sizeComponent.props.width, height: sizeComponent.props.height });
      }
    });
  },
});

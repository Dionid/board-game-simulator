import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import { PositionComponent, ReactPositionComponent } from '../../components';

export const ChangeReactPositionSystem = (): System<{
  ReactPositionComponent: ReactPositionComponent;
  PositionComponent: PositionComponent;
}> => ({
  run: async ({ essence }) => {
    const entities = Essence.filter(essence, ['ReactPositionComponent', 'PositionComponent']);
    if (entities.length === 0) {
      return;
    }

    const positionPool = Essence.getOrAddPool(essence, 'PositionComponent');
    const reactPositionPool = Essence.getOrAddPool(essence, 'ReactPositionComponent');

    entities.forEach((entity) => {
      const positionComponent = Pool.get(positionPool, entity);
      const reactPositionComponent = Pool.get(reactPositionPool, entity);
      if (
        reactPositionComponent.data.state.x !== positionComponent.data.x ||
        reactPositionComponent.data.state.y !== positionComponent.data.y
      ) {
        reactPositionComponent.data.setState({ x: positionComponent.data.x, y: positionComponent.data.y });
      }
    });
  },
});

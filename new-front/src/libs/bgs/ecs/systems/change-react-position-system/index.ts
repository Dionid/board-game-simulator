import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import { ReactPositionComponent } from '../../../../ecs/react/components';
import { PositionComponent } from '../../components';

export const ChangeReactPositionSystem = (): System => ({
  run: async ({ essence }) => {
    const entities = Essence.getEntitiesByComponents(essence, [ReactPositionComponent, PositionComponent]);
    if (entities.length === 0) {
      return;
    }

    const positionPool = Essence.getOrAddPool(essence, PositionComponent);
    const reactPositionPool = Essence.getOrAddPool(essence, ReactPositionComponent);

    entities.forEach((entity) => {
      const positionComponent = Pool.get(positionPool, entity);
      const reactPositionComponent = Pool.get(reactPositionPool, entity);
      if (
        reactPositionComponent.props.state.x !== positionComponent.props.x ||
        reactPositionComponent.props.state.y !== positionComponent.props.y
      ) {
        reactPositionComponent.props.setState({ x: positionComponent.props.x, y: positionComponent.props.y });
      }
    });
  },
});

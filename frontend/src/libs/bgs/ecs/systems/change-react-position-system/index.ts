import { System } from '../../../../ecs/system';
import { World } from '../../../../ecs/world';
import { Pool } from '../../../../ecs/component';
import { PositionComponent, ReactPositionComponent } from '../../components';

export const ChangeReactPositionSystem = (): System<{
  ReactPositionComponent: ReactPositionComponent;
  PositionComponent: PositionComponent;
}> => ({
  run: async (world) => {
    const entities = World.filter(world, ['ReactPositionComponent', 'PositionComponent']);
    if (entities.length === 0) {
      return;
    }

    const positionPool = World.getOrAddPool(world, 'PositionComponent');
    const reactPositionPool = World.getOrAddPool(world, 'ReactPositionComponent');

    entities.forEach((entity) => {
      const positionComponent = Pool.get(positionPool, entity);
      const reactPositionComponent = Pool.get(reactPositionPool, entity);
      reactPositionComponent.data.setState({ x: positionComponent.data.x, y: positionComponent.data.y });
    });
  },
});

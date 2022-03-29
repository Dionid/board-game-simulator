import { System } from '../../../../ecs/system';
import { BoardComponent, BoardComponentName } from '../../components';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';

export const BoardSystem = (): System<{
  [BoardComponentName]: BoardComponent;
}> => {
  return {
    // TODO. Think how to sync this across players
    init: async ({ world }) => {
      const boardComponentPool = World.getOrAddPool(world, 'BoardComponent');

      const boardComponent = {
        name: 'BoardComponent',
        id: ComponentId.new(),
        data: {
          // TODO. move somewhere (as deps or ctx)
          width: 10000,
          height: 10000,
        },
      };
      Pool.add(boardComponentPool, EntityId.new(), boardComponent);
    },
    run: async (props) => {},
  };
};

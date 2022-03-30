import { System } from '../../../../ecs/system';
import { BoardComponent, BoardComponentName } from '../../components';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { EntityId } from '../../../../ecs/entity';
import { Size } from '../../../../math';

export const BoardSystem = (
  boardSize: Size
): System<{
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
          width: boardSize.width,
          height: boardSize.height,
        },
      };
      Pool.add(boardComponentPool, EntityId.new(), boardComponent);
    },
    run: async (props) => {},
  };
};

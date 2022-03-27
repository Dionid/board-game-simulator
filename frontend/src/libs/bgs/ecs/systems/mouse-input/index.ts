import { System } from '../../../../ecs/system';
import { HandComponent, OwnerComponent, PlayerComponent } from '../../components';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';

export const MouseInputSystem = (): System<{
  HandComponent: HandComponent;
  PlayerComponent: PlayerComponent;
  OwnerComponent: OwnerComponent;
}> => {
  const mouseData = {
    x: 0,
    y: 0,
    down: false,
  };

  return {
    init: async (world) => {
      const entities = World.filter(world, ['PlayerComponent']);

      entities.forEach((entity) => {
        const mousePool = World.getOrAddPool(world, 'HandComponent');
        Pool.add(mousePool, entity, {
          id: ComponentId.new(),
          name: 'HandComponent',
          data: {
            x: 0,
            y: 0,
            down: false,
          },
        });
      });

      document.body.onmousedown = () => {
        mouseData.down = true;
      };
      document.body.onmouseup = () => {
        mouseData.down = false;
      };

      document.onmousemove = (event) => {
        mouseData.x = event.pageX;
        mouseData.y = event.pageY;
      };
    },
    run: async (world) => {
      const entities = World.filter(world, ['HandComponent', 'PlayerComponent', 'OwnerComponent']);

      const mousePool = World.getOrAddPool(world, 'HandComponent');

      entities.forEach((entity) => {
        const component = Pool.get(mousePool, entity);
        component.data.x = mouseData.x;
        component.data.y = mouseData.y;
        component.data.down = mouseData.down;
      });
    },
  };
};

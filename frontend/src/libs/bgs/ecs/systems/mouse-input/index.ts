import { System } from '../../../../ecs/system';
import { HandComponent, OwnerComponent, PlayerComponent } from '../../components';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';

export const MouseInputSystem = (): System<{
  HandComponent: HandComponent;
  PlayerComponent: PlayerComponent;
  OwnerComponent: OwnerComponent;
}> => {
  const lastMouseData = {
    x: 0,
    y: 0,
    down: false,
  };

  return {
    init: async ({ world }) => {
      const entities = World.filter(world, ['PlayerComponent']);

      entities.forEach((entity) => {
        const mousePool = World.getOrAddPool(world, 'HandComponent');
        Pool.add(mousePool, entity, {
          id: ComponentId.new(),
          name: 'HandComponent',
          data: {
            current: {
              x: 0,
              y: 0,
              down: false,
            },
            previous: {
              x: 0,
              y: 0,
              down: false,
            },
          },
        });
      });

      document.body.onmousedown = () => {
        lastMouseData.down = true;
      };
      document.body.onmouseup = () => {
        lastMouseData.down = false;
      };

      document.onmousemove = (event) => {
        lastMouseData.x = event.pageX;
        lastMouseData.y = event.pageY;
      };
    },
    run: async ({ world }) => {
      const entities = World.filter(world, ['HandComponent', 'PlayerComponent', 'OwnerComponent']);

      const mousePool = World.getOrAddPool(world, 'HandComponent');

      entities.forEach((entity) => {
        const component = Pool.get(mousePool, entity);
        component.data.previous = component.data.current;
        component.data.current = {
          x: lastMouseData.x,
          y: lastMouseData.y,
          down: lastMouseData.down,
        };
      });
    },
  };
};

import { System } from '../../../../ecs/system';
import { CameraComponent, CameraComponentName, PlayerComponent, PlayerComponentName } from '../../components';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';

export const CameraSystem = (): System<{
  [CameraComponentName]: CameraComponent;
  [PlayerComponentName]: PlayerComponent;
}> => {
  return {
    init: async ({ world }) => {
      const cameraComponentPool = World.getOrAddPool(world, 'CameraComponent');
      const playerEntityId = World.filter(world, ['PlayerComponent']);

      playerEntityId.forEach((playerEntityId) => {
        const cameraComponent = {
          name: 'CameraComponent',
          id: ComponentId.new(),
          data: {
            x: 0,
            y: 0,
            // TODO. move somewhere (as deps or ctx)
            width: window.innerWidth,
            height: window.innerHeight,
          },
        };
        Pool.add(cameraComponentPool, playerEntityId, cameraComponent);
        // TODO. Move somewhere (as deps or ctx)
        window.addEventListener('resize', () => {
          cameraComponent.data.width = window.innerWidth;
          cameraComponent.data.height = window.innerHeight;
        });
      });
    },
    run: async (props) => {},
  };
};

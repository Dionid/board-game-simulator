import { System } from '../../../../ecs/system';
import {
  BoardComponent,
  BoardComponentName,
  CameraComponent,
  CameraComponentName,
  HandComponent,
  PlayerComponent,
  PlayerComponentName,
} from '../../components';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';

export const CameraSystem = (): System<{
  [CameraComponentName]: CameraComponent;
  [PlayerComponentName]: PlayerComponent;
  [BoardComponentName]: BoardComponent;
  HandComponent: HandComponent;
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
    run: async ({ world, timeDelta }) => {
      const entities = World.filter(world, ['PlayerComponent', 'HandComponent', 'CameraComponent']);
      const cameraComponentPool = World.getOrAddPool(world, 'CameraComponent');
      const handPool = World.getOrAddPool(world, 'HandComponent');

      const boardEntity = World.filter(world, ['BoardComponent']);
      const boardComponentPool = World.getOrAddPool(world, 'BoardComponent');

      const boardC = Pool.get(boardComponentPool, boardEntity[0]);

      // TODO. Filter only out players move
      entities.forEach((playerEntityId) => {
        const handC = Pool.get(handPool, playerEntityId);
        const cameraC = Pool.get(cameraComponentPool, playerEntityId);
        const margin = 20;
        const velocity = timeDelta * 0.5;
        // . Check that camera position is more than 0 and less than board size
        if (handC.data.current.x > cameraC.data.width - margin) {
          const newX = cameraC.data.x + velocity;
          if (newX + cameraC.data.width < boardC.data.width) {
            console.log('RIGHT');
            cameraC.data.x = newX;
          }
        } else if (handC.data.current.x < margin) {
          const newX = cameraC.data.x - velocity;
          if (newX > 0) {
            console.log('LEFT');
            cameraC.data.x = newX;
          }
        } else if (handC.data.current.y < margin) {
          const newY = cameraC.data.y - velocity;
          if (newY > 0) {
            console.log('TOP');
            cameraC.data.y = newY;
          }
        } else if (handC.data.current.y > cameraC.data.height - margin) {
          const newY = cameraC.data.y + velocity;
          if (newY + cameraC.data.height < boardC.data.height) {
            console.log('DOWN');
            cameraC.data.y = newY;
          }
        }
      });
    },
  };
};

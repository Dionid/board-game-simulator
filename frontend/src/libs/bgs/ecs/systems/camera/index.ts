import { System } from '../../../../ecs/system';
import {
  BoardComponent,
  BoardComponentName,
  CameraComponent,
  CameraComponentName,
  HandComponent,
  PlayerComponent,
  PlayerComponentName,
  PositionComponent,
  PositionComponentName,
  SizeComponent,
  SizeComponentName,
} from '../../components';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';

export const CameraSystem = (): System<{
  [CameraComponentName]: CameraComponent;
  [PositionComponentName]: PositionComponent;
  [SizeComponentName]: SizeComponent;
  [PlayerComponentName]: PlayerComponent;
  [BoardComponentName]: BoardComponent;
  HandComponent: HandComponent;
}> => {
  return {
    init: async ({ world }) => {
      const cameraComponentPool = World.getOrAddPool(world, 'CameraComponent');
      const positionComponentPool = World.getOrAddPool(world, 'PositionComponent');
      const sizeComponentPool = World.getOrAddPool(world, 'SizeComponent');
      const playerEntityId = World.filter(world, ['PlayerComponent']);

      playerEntityId.forEach((playerEntityId) => {
        const cameraComponent = {
          name: 'CameraComponent',
          id: ComponentId.new(),
          data: {},
        };
        Pool.add(cameraComponentPool, playerEntityId, cameraComponent);
        const positionComponent = {
          name: 'PositionComponent',
          id: ComponentId.new(),
          data: {
            x: 0,
            y: 0,
          },
        };
        Pool.add(positionComponentPool, playerEntityId, positionComponent);
        const sizeComponent = {
          name: 'SizeComponent',
          id: ComponentId.new(),
          data: {
            // TODO. move somewhere (as deps or ctx)
            width: window.innerWidth,
            height: window.innerHeight,
          },
        };
        Pool.add(sizeComponentPool, playerEntityId, sizeComponent);
        // TODO. Move somewhere (as deps or ctx)
        window.addEventListener('resize', () => {
          sizeComponent.data.width = window.innerWidth;
          sizeComponent.data.height = window.innerHeight;
        });
      });
    },
    run: async ({ world, timeDelta }) => {
      const entities = World.filter(world, ['PlayerComponent', 'HandComponent', 'CameraComponent']);
      const positionComponentPool = World.getOrAddPool(world, 'PositionComponent');
      const sizeComponentPool = World.getOrAddPool(world, 'SizeComponent');
      const handPool = World.getOrAddPool(world, 'HandComponent');

      const boardEntity = World.filter(world, ['BoardComponent']);
      const boardComponentPool = World.getOrAddPool(world, 'BoardComponent');

      // TODO. Singleton entities
      const boardC = Pool.get(boardComponentPool, boardEntity[0]);

      // TODO. Filter only cyrrent player move
      entities.forEach((playerEntityId) => {
        const handC = Pool.get(handPool, playerEntityId);
        const positionC = Pool.get(positionComponentPool, playerEntityId);
        const sizeC = Pool.get(sizeComponentPool, playerEntityId);

        const margin = 20;
        const velocity = timeDelta * 0.5;
        // . Check that camera position is more than 0 and less than board size
        if (handC.data.onCameraPosition.current.x > sizeC.data.width - margin) {
          const newX = positionC.data.x + velocity;
          if (newX + sizeC.data.width < boardC.data.width) {
            console.log('RIGHT');
            positionC.data.x = newX;
          }
        } else if (handC.data.onCameraPosition.current.x < margin) {
          const newX = positionC.data.x - velocity;
          if (newX > 0) {
            console.log('LEFT');
            positionC.data.x = newX;
          }
        } else if (handC.data.onCameraPosition.current.y < margin) {
          const newY = positionC.data.y - velocity;
          if (newY > 0) {
            console.log('TOP');
            positionC.data.y = newY;
          }
        } else if (handC.data.onCameraPosition.current.y > sizeC.data.height - margin) {
          const newY = positionC.data.y + velocity;
          if (newY + sizeC.data.height < boardC.data.height) {
            console.log('DOWN');
            positionC.data.y = newY;
          }
        }
      });
    },
  };
};

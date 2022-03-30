import { System } from '../../../../ecs/system';
import {
  BoardComponent,
  BoardComponentName,
  CameraComponent,
  CameraComponentName,
  HandComponent,
  HandComponentName,
  PanModeComponent,
  PanModeComponentName,
  PlayerComponent,
  PlayerComponentName,
  PositionComponent,
  PositionComponentName,
  SizeComponent,
  SizeComponentName,
} from '../../components';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { Vector2 } from '../../../../math';

export const CameraSystem = (): System<{
  [CameraComponentName]: CameraComponent;
  [PositionComponentName]: PositionComponent;
  [SizeComponentName]: SizeComponent;
  [PlayerComponentName]: PlayerComponent;
  [BoardComponentName]: BoardComponent;
  [PanModeComponentName]: PanModeComponent;
  [HandComponentName]: HandComponent;
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
      const panModeEntities = World.filter(world, ['PanModeComponent']);
      const positionComponentPool = World.getOrAddPool(world, 'PositionComponent');
      const sizeComponentPool = World.getOrAddPool(world, 'SizeComponent');
      const handPool = World.getOrAddPool(world, 'HandComponent');

      const boardEntity = World.filter(world, ['BoardComponent']);
      const boardComponentPool = World.getOrAddPool(world, 'BoardComponent');

      // TODO. Singleton entities
      const boardC = Pool.get(boardComponentPool, boardEntity[0]);

      // TODO. Filter only current player move
      entities.forEach((playerEntityId) => {
        const handC = Pool.get(handPool, playerEntityId);
        const positionC = Pool.get(positionComponentPool, playerEntityId);
        const sizeC = Pool.get(sizeComponentPool, playerEntityId);

        const newPosition: Vector2 = {
          x: positionC.data.x,
          y: positionC.data.y,
        };

        // Pan mode
        if (panModeEntities.length > 0) {
          if (handC.data.click.current.down) {
            const delta = Vector2.compareAndChange(
              handC.data.onCameraPosition.previous,
              handC.data.onCameraPosition.current
            );
            newPosition.x -= delta.x;
            newPosition.y -= delta.y;
          }
        } else {
          const margin = 20;
          const velocity = timeDelta * 0.5;
          // . Check that camera position is more than 0 and less than board size
          if (handC.data.onCameraPosition.current.x > sizeC.data.width - margin) {
            // console.log('RIGHT');
            newPosition.x += velocity;
          } else if (handC.data.onCameraPosition.current.x < margin) {
            // console.log('LEFT');
            newPosition.x -= velocity;
          } else if (handC.data.onCameraPosition.current.y < margin) {
            // console.log('TOP');
            newPosition.y -= velocity;
          } else if (handC.data.onCameraPosition.current.y > sizeC.data.height - margin) {
            // console.log('DOWN');
            newPosition.y += velocity;
          }
        }

        // . Restrict
        if (newPosition.x > 0 && newPosition.x + sizeC.data.width < boardC.data.width) {
          positionC.data.x = newPosition.x;
        }
        if (newPosition.y > 0 && newPosition.y + sizeC.data.height < boardC.data.height) {
          positionC.data.y = newPosition.y;
        }
      });
    },
  };
};

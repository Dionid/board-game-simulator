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
  ScaleComponent,
  ScaleComponentName,
  SizeComponent,
  SizeComponentName,
} from '../../components';
import { World } from '../../../../ecs/world';
import { ComponentId, Pool } from '../../../../ecs/component';
import { Vector2 } from '../../../../math';

export const CameraSystem = (): System<{
  [CameraComponentName]: CameraComponent;
  [PositionComponentName]: PositionComponent;
  [ScaleComponentName]: ScaleComponent;
  [SizeComponentName]: SizeComponent;
  [PlayerComponentName]: PlayerComponent;
  [BoardComponentName]: BoardComponent;
  [PanModeComponentName]: PanModeComponent;
  [HandComponentName]: HandComponent;
}> => {
  return {
    init: async ({ world }) => {
      const cameraCP = World.getOrAddPool(world, CameraComponentName);
      const positionCP = World.getOrAddPool(world, PositionComponentName);
      const sizeCP = World.getOrAddPool(world, SizeComponentName);
      const scaleCP = World.getOrAddPool(world, ScaleComponentName);
      const playerEntityId = World.filter(world, [PlayerComponentName]);

      const boardEntity = World.filter(world, [BoardComponentName]);
      const boardCP = World.getOrAddPool(world, BoardComponentName);

      // TODO. Singleton entities
      const boardC = Pool.get(boardCP, boardEntity[0]);

      playerEntityId.forEach((playerEntityId) => {
        const cameraComponent = {
          name: 'CameraComponent',
          id: ComponentId.new(),
          data: {},
        };
        const cameraSize = {
          // TODO. move somewhere (as deps or ctx)
          width: window.innerWidth,
          height: window.innerHeight,
        };
        Pool.add(cameraCP, playerEntityId, cameraComponent);
        // POSITION
        const positionComponent = {
          name: 'PositionComponent',
          id: ComponentId.new(),
          data: {
            x: boardC.data.width / 2 - cameraSize.width / 2,
            y: boardC.data.height / 2 - cameraSize.height / 2,
          },
        };
        Pool.add(positionCP, playerEntityId, positionComponent);
        // SIZE
        const sizeComponent = {
          name: 'SizeComponent',
          id: ComponentId.new(),
          data: cameraSize,
        };
        Pool.add(sizeCP, playerEntityId, sizeComponent);
        // TODO. Move somewhere (as deps or ctx)
        window.addEventListener('resize', () => {
          sizeComponent.data.width = window.innerWidth;
          sizeComponent.data.height = window.innerHeight;
        });
        // SCALE
        Pool.add(scaleCP, playerEntityId, {
          id: ComponentId.new(),
          name: ScaleComponentName,
          data: {
            x: 1,
            y: 1,
          },
        });
      });
    },
    run: async ({ world, timeDelta }) => {
      const entities = World.filter(world, ['PlayerComponent', 'HandComponent', 'CameraComponent']);
      const panModeEntities = World.filter(world, ['PanModeComponent']);
      const positionCP = World.getOrAddPool(world, 'PositionComponent');
      const sizeCP = World.getOrAddPool(world, 'SizeComponent');
      const handPool = World.getOrAddPool(world, 'HandComponent');
      const scaleCP = World.getOrAddPool(world, ScaleComponentName);

      const boardEntity = World.filter(world, ['BoardComponent']);
      const boardCP = World.getOrAddPool(world, 'BoardComponent');

      // TODO. Singleton entities
      const boardC = Pool.get(boardCP, boardEntity[0]);

      // TODO. Filter only current player move
      entities.forEach((playerEntityId) => {
        const handC = Pool.get(handPool, playerEntityId);
        const positionC = Pool.get(positionCP, playerEntityId);
        const sizeC = Pool.get(sizeCP, playerEntityId);
        const cameraScaleC = Pool.get(scaleCP, playerEntityId);

        const newPosition: Vector2 = {
          x: positionC.data.x,
          y: positionC.data.y,
        };

        // . Pan mode
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
          // // . Hand near border feature
          // const margin = 20;
          // const velocity = timeDelta * 0.5;
          // // . Check that camera position is more than 0 and less than board size
          // if (handC.data.onCameraPosition.current.x > sizeC.data.width - margin) {
          //   // console.log('RIGHT');
          //   newPosition.x += velocity;
          // } else if (handC.data.onCameraPosition.current.x < margin) {
          //   // console.log('LEFT');
          //   newPosition.x -= velocity;
          // } else if (handC.data.onCameraPosition.current.y < margin) {
          //   // console.log('TOP');
          //   newPosition.y -= velocity;
          // } else if (handC.data.onCameraPosition.current.y > sizeC.data.height - margin) {
          //   // console.log('DOWN');
          //   newPosition.y += velocity;
          // }
        }

        // . Restrict
        if (newPosition.x > 0 && newPosition.x + sizeC.data.width / cameraScaleC.data.x < boardC.data.width) {
          positionC.data.x = newPosition.x;
        }
        if (newPosition.y > 0 && newPosition.y + sizeC.data.height / cameraScaleC.data.y < boardC.data.height) {
          positionC.data.y = newPosition.y;
        }
      });
    },
  };
};

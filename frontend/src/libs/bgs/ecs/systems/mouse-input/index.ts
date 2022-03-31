import { System } from '../../../../ecs/system';
import {
  CameraComponent,
  CameraComponentName,
  HandComponent,
  HandComponentName,
  OwnerComponent,
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

export const HandInputSystem = (): System<{
  [HandComponentName]: HandComponent;
  PlayerComponent: PlayerComponent;
  OwnerComponent: OwnerComponent;
  [PositionComponentName]: PositionComponent;
  [SizeComponentName]: SizeComponent;
  [ScaleComponentName]: ScaleComponent;
  [CameraComponentName]: CameraComponent;
}> => {
  const lastMouseData = {
    x: 0,
    y: 0,
    down: false,
  };

  return {
    init: async ({ world }) => {
      const entities = World.filter(world, ['PlayerComponent']);
      const mousePool = World.getOrAddPool(world, 'HandComponent');

      // TODO. Fix for collaboration
      const playerEntity = entities[0];

      Pool.add(mousePool, playerEntity, {
        id: ComponentId.new(),
        name: 'HandComponent',
        data: {
          onBoardPosition: {
            current: {
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
            },
            previous: {
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
            },
          },
          onCameraPosition: {
            current: {
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
            },
            previous: {
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
            },
          },
          click: {
            previous: {
              down: false,
            },
            current: {
              down: false,
            },
          },
        },
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

      const mouseCP = World.getOrAddPool(world, 'HandComponent');
      const positionCP = World.getOrAddPool(world, 'PositionComponent');
      const scaleCP = World.getOrAddPool(world, ScaleComponentName);

      const playerCameraEntities = World.filter(world, [PlayerComponentName, CameraComponentName, ScaleComponentName]);
      const playerCameraEntity = playerCameraEntities[0];
      const cameraScaleC = Pool.get(scaleCP, playerCameraEntity);

      entities.forEach((entity) => {
        const component = Pool.get(mouseCP, entity);
        const cameraPositionComponent = Pool.get(positionCP, entity);

        component.data.onCameraPosition.previous = component.data.onCameraPosition.current;
        component.data.onBoardPosition.previous = component.data.onBoardPosition.current;
        component.data.click.previous = component.data.click.current;

        component.data.onCameraPosition.current = {
          x: lastMouseData.x,
          y: lastMouseData.y,
        };
        component.data.onBoardPosition.current = {
          x: lastMouseData.x / cameraScaleC.data.x + cameraPositionComponent.data.x,
          y: lastMouseData.y / cameraScaleC.data.y + cameraPositionComponent.data.y,
        };
        component.data.click.current = {
          down: lastMouseData.down,
        };
      });
    },
  };
};

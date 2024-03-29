import { System } from '../../../../ecs/system';
import {
  CameraComponent,
  CameraComponentName,
  HandComponent,
  HandComponentName,
  OwnerComponent,
  OwnerComponentName,
  PlayerComponent,
  PlayerComponentName,
  PositionComponent,
  PositionComponentName,
  ScaleComponent,
  ScaleComponentName,
  SizeComponent,
  SizeComponentName,
} from '../../components';
import { Essence } from '../../../../ecs/essence';
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
    init: async ({ essence }) => {
      const entities = Essence.filter(essence, [PlayerComponentName]);
      const mousePool = Essence.getOrAddPool(essence, HandComponentName);

      // TODO. Fix for collaboration
      const playerEntity = entities[0];

      Pool.add(mousePool, playerEntity, {
        id: ComponentId.new(),
        name: HandComponentName,
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
    run: async ({ essence }) => {
      const entities = Essence.filter(essence, [HandComponentName, PlayerComponentName, OwnerComponentName]);
      if (entities.length === 0) {
        return;
      }

      const mouseCP = Essence.getOrAddPool(essence, HandComponentName);
      const positionCP = Essence.getOrAddPool(essence, PositionComponentName);
      const scaleCP = Essence.getOrAddPool(essence, ScaleComponentName);

      const playerCameraEntities = Essence.filter(essence, [
        PlayerComponentName,
        CameraComponentName,
        ScaleComponentName,
      ]);
      if (playerCameraEntities.length === 0) {
        return;
      }
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

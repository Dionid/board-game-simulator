import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import { FingerComponent, PositionComponent, ScaleComponent } from '../../components';
import { EntityId } from '../../../../ecs/entity';

export const FingerInputSystem = (): System<{
  playerEntity: EntityId;
  cameraEntity: EntityId;
}> => {
  const lastMouseData = {
    x: 0,
    y: 0,
    down: false,
  };

  return {
    init: async ({ essence, ctx: { playerEntity } }) => {
      const mousePool = Essence.getOrAddPool(essence, FingerComponent);

      Pool.add(
        mousePool,
        playerEntity,
        FingerComponent.new({
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
        })
      );

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
    run: async ({ essence, ctx: { playerEntity, cameraEntity } }) => {
      const fingerCP = Essence.getOrAddPool(essence, FingerComponent);
      const positionCP = Essence.getOrAddPool(essence, PositionComponent);
      const scaleCP = Essence.getOrAddPool(essence, ScaleComponent);

      const cameraScaleC = Pool.get(scaleCP, cameraEntity);
      const cameraPositionC = Pool.get(positionCP, cameraEntity);
      const fingerC = Pool.get(fingerCP, playerEntity);

      // # Update
      // if (fingerC.props.onCameraPosition.previous.x !== fingerC.props.onCameraPosition.current.x) {
      //   fingerC.props.onCameraPosition.previous.x = fingerC.props.onCameraPosition.current.x;
      // }
      // if (fingerC.props.onCameraPosition.previous.y !== fingerC.props.onCameraPosition.current.y) {
      //   fingerC.props.onCameraPosition.previous.y = fingerC.props.onCameraPosition.current.y;
      // }
      fingerC.props.onCameraPosition.previous = {
        ...fingerC.props.onCameraPosition.current,
      };

      // if (fingerC.props.onBoardPosition.previous.x !== fingerC.props.onBoardPosition.current.x) {
      //   fingerC.props.onBoardPosition.previous.x = fingerC.props.onBoardPosition.current.x;
      // }
      // if (fingerC.props.onBoardPosition.previous.y !== fingerC.props.onBoardPosition.current.y) {
      //   fingerC.props.onBoardPosition.previous.y = fingerC.props.onBoardPosition.current.y;
      // }
      fingerC.props.onBoardPosition.previous = {
        ...fingerC.props.onBoardPosition.current,
      };

      // if (fingerC.props.click.previous.down !== fingerC.props.click.current.down) {
      //   fingerC.props.click.previous.down = fingerC.props.click.current.down;
      // }
      fingerC.props.click.previous = {
        ...fingerC.props.click.current,
      };

      // if (fingerC.props.onCameraPosition.current.x !== lastMouseData.x) {
      //   fingerC.props.onCameraPosition.current.x = lastMouseData.x;
      // }
      // if (fingerC.props.onCameraPosition.current.y !== lastMouseData.y) {
      //   fingerC.props.onCameraPosition.current.y = lastMouseData.y;
      // }
      fingerC.props.onCameraPosition.current = {
        ...lastMouseData,
      };

      // if (
      //   fingerC.props.onBoardPosition.current.x !==
      //   lastMouseData.x / cameraScaleC.props.x + cameraPositionC.props.x
      // ) {
      //   fingerC.props.onBoardPosition.current.x = lastMouseData.x / cameraScaleC.props.x + cameraPositionC.props.x;
      // }
      // if (
      //   fingerC.props.onBoardPosition.current.y !==
      //   lastMouseData.y / cameraScaleC.props.y + cameraPositionC.props.y
      // ) {
      //   fingerC.props.onBoardPosition.current.y = lastMouseData.y / cameraScaleC.props.y + cameraPositionC.props.y;
      // }
      fingerC.props.onBoardPosition.current = {
        x: lastMouseData.x / cameraScaleC.props.x + cameraPositionC.props.x,
        y: lastMouseData.y / cameraScaleC.props.y + cameraPositionC.props.y,
      };

      // if (fingerC.props.click.current.down !== lastMouseData.down) {
      //   fingerC.props.click.current.down = lastMouseData.down;
      // }
      fingerC.props.click.current = {
        down: lastMouseData.down,
      };
    },
  };
};

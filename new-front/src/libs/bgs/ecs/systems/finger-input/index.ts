import { System, SystemProps } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import { FingerComponent, PositionComponent, ScaleComponent } from '../../components';
import { EntityId } from '../../../../ecs/entity';
import { useIsInitial } from '../../../../ecs/effect/use-init';
import { useRef } from '../../../../ecs/effect/use-ref';

export const FingerInputSystem = (): System<{
  playerEntity: EntityId;
  cameraEntity: EntityId;
}> => {
  // const lastMouseData = {
  //   x: 0,
  //   y: 0,
  //   down: false,
  // };

  const init = (
    {
      essence,
      ctx,
    }: SystemProps<{
      playerEntity: EntityId;
      cameraEntity: EntityId;
    }>,
    lastMouseData: { x: number; y: number; down: boolean }
  ) => {
    const { playerEntity } = ctx();
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
  };

  return {
    run: (world) => {
      const lastMouseData = useRef({
        x: 0,
        y: 0,
        down: false,
      });

      const { essence, ctx } = world;
      const { playerEntity, cameraEntity } = ctx();

      const initial = useIsInitial();

      if (initial) {
        console.log('INITIAL FINGER');
        init(world, lastMouseData.current);
        return;
      }

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
        ...lastMouseData.current,
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
        x: lastMouseData.current.x / cameraScaleC.props.x + cameraPositionC.props.x,
        y: lastMouseData.current.y / cameraScaleC.props.y + cameraPositionC.props.y,
      };

      // if (fingerC.props.click.current.down !== lastMouseData.down) {
      //   fingerC.props.click.current.down = lastMouseData.down;
      // }
      fingerC.props.click.current = {
        down: lastMouseData.current.down,
      };
    },
  };
};

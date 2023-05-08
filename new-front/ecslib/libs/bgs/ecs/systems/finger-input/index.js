import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import { FingerComponent, PositionComponent, ScaleComponent } from '../../components';
import { useIsInitial } from '../../../../ecs/hooks/use-init';
import { useRef } from '../../../../ecs/hooks/use-ref';
export const FingerInputSystem = () => {
  // const lastMouseData = {
  //   x: 0,
  //   y: 0,
  //   down: false,
  // };
  const init = ({ essence, ctx }, lastMouseData) => {
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
  return (world) => {
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
    // if (fingerC.onCameraPosition.previous.x !== fingerC.onCameraPosition.current.x) {
    //   fingerC.onCameraPosition.previous.x = fingerC.onCameraPosition.current.x;
    // }
    // if (fingerC.onCameraPosition.previous.y !== fingerC.onCameraPosition.current.y) {
    //   fingerC.onCameraPosition.previous.y = fingerC.onCameraPosition.current.y;
    // }
    fingerC.onCameraPosition.previous = {
      ...fingerC.onCameraPosition.current,
    };
    // if (fingerC.onBoardPosition.previous.x !== fingerC.onBoardPosition.current.x) {
    //   fingerC.onBoardPosition.previous.x = fingerC.onBoardPosition.current.x;
    // }
    // if (fingerC.onBoardPosition.previous.y !== fingerC.onBoardPosition.current.y) {
    //   fingerC.onBoardPosition.previous.y = fingerC.onBoardPosition.current.y;
    // }
    fingerC.onBoardPosition.previous = {
      ...fingerC.onBoardPosition.current,
    };
    // if (fingerC.click.previous.down !== fingerC.click.current.down) {
    //   fingerC.click.previous.down = fingerC.click.current.down;
    // }
    fingerC.click.previous = {
      ...fingerC.click.current,
    };
    // if (fingerC.onCameraPosition.current.x !== lastMouseData.x) {
    //   fingerC.onCameraPosition.current.x = lastMouseData.x;
    // }
    // if (fingerC.onCameraPosition.current.y !== lastMouseData.y) {
    //   fingerC.onCameraPosition.current.y = lastMouseData.y;
    // }
    fingerC.onCameraPosition.current = {
      ...lastMouseData.current,
    };
    // if (
    //   fingerC.onBoardPosition.current.x !==
    //   lastMouseData.x / cameraScaleC.x + cameraPositionC.x
    // ) {
    //   fingerC.onBoardPosition.current.x = lastMouseData.x / cameraScaleC.x + cameraPositionC.x;
    // }
    // if (
    //   fingerC.onBoardPosition.current.y !==
    //   lastMouseData.y / cameraScaleC.y + cameraPositionC.y
    // ) {
    //   fingerC.onBoardPosition.current.y = lastMouseData.y / cameraScaleC.y + cameraPositionC.y;
    // }
    fingerC.onBoardPosition.current = {
      x: lastMouseData.current.x / cameraScaleC.x + cameraPositionC.x,
      y: lastMouseData.current.y / cameraScaleC.y + cameraPositionC.y,
    };
    // if (fingerC.click.current.down !== lastMouseData.down) {
    //   fingerC.click.current.down = lastMouseData.down;
    // }
    fingerC.click.current = {
      down: lastMouseData.current.down,
    };
  };
};

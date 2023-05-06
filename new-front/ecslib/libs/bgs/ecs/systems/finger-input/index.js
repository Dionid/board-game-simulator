var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import { FingerComponent, PositionComponent, ScaleComponent } from '../../components';
import { useIsInitial } from '../../../../ecs/hooks/use-init';
import { useRef } from '../../../../ecs/hooks/use-ref';
export var FingerInputSystem = function () {
  // const lastMouseData = {
  //   x: 0,
  //   y: 0,
  //   down: false,
  // };
  var init = function (_a, lastMouseData) {
    var essence = _a.essence,
      ctx = _a.ctx;
    var playerEntity = ctx().playerEntity;
    var mousePool = Essence.getOrAddPool(essence, FingerComponent);
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
    document.body.onmousedown = function () {
      lastMouseData.down = true;
    };
    document.body.onmouseup = function () {
      lastMouseData.down = false;
    };
    document.onmousemove = function (event) {
      lastMouseData.x = event.pageX;
      lastMouseData.y = event.pageY;
    };
  };
  return function (world) {
    var lastMouseData = useRef({
      x: 0,
      y: 0,
      down: false,
    });
    var essence = world.essence,
      ctx = world.ctx;
    var _a = ctx(),
      playerEntity = _a.playerEntity,
      cameraEntity = _a.cameraEntity;
    var initial = useIsInitial();
    if (initial) {
      console.log('INITIAL FINGER');
      init(world, lastMouseData.current);
      return;
    }
    var fingerCP = Essence.getOrAddPool(essence, FingerComponent);
    var positionCP = Essence.getOrAddPool(essence, PositionComponent);
    var scaleCP = Essence.getOrAddPool(essence, ScaleComponent);
    var cameraScaleC = Pool.get(scaleCP, cameraEntity);
    var cameraPositionC = Pool.get(positionCP, cameraEntity);
    var fingerC = Pool.get(fingerCP, playerEntity);
    // # Update
    // if (fingerC.onCameraPosition.previous.x !== fingerC.onCameraPosition.current.x) {
    //   fingerC.onCameraPosition.previous.x = fingerC.onCameraPosition.current.x;
    // }
    // if (fingerC.onCameraPosition.previous.y !== fingerC.onCameraPosition.current.y) {
    //   fingerC.onCameraPosition.previous.y = fingerC.onCameraPosition.current.y;
    // }
    fingerC.onCameraPosition.previous = __assign({}, fingerC.onCameraPosition.current);
    // if (fingerC.onBoardPosition.previous.x !== fingerC.onBoardPosition.current.x) {
    //   fingerC.onBoardPosition.previous.x = fingerC.onBoardPosition.current.x;
    // }
    // if (fingerC.onBoardPosition.previous.y !== fingerC.onBoardPosition.current.y) {
    //   fingerC.onBoardPosition.previous.y = fingerC.onBoardPosition.current.y;
    // }
    fingerC.onBoardPosition.previous = __assign({}, fingerC.onBoardPosition.current);
    // if (fingerC.click.previous.down !== fingerC.click.current.down) {
    //   fingerC.click.previous.down = fingerC.click.current.down;
    // }
    fingerC.click.previous = __assign({}, fingerC.click.current);
    // if (fingerC.onCameraPosition.current.x !== lastMouseData.x) {
    //   fingerC.onCameraPosition.current.x = lastMouseData.x;
    // }
    // if (fingerC.onCameraPosition.current.y !== lastMouseData.y) {
    //   fingerC.onCameraPosition.current.y = lastMouseData.y;
    // }
    fingerC.onCameraPosition.current = __assign({}, lastMouseData.current);
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

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
import { Vector2 } from '../../../../math';
import {
  CameraComponent,
  PositionComponent,
  SizeComponent,
  ScaleComponent,
  FingerComponent,
  PanModeComponent,
} from '../../components';
import { useIsInitial } from '../../../../ecs/hooks/use-init';
export var CameraSystem = function () {
  var init = function (_a) {
    var essence = _a.essence,
      ctx = _a.ctx;
    var _b = ctx(),
      cameraEntity = _b.cameraEntity,
      boardSize = _b.boardSize;
    var cameraP = Essence.getOrAddPool(essence, CameraComponent);
    var positionP = Essence.getOrAddPool(essence, PositionComponent);
    var sizeP = Essence.getOrAddPool(essence, SizeComponent);
    var scaleP = Essence.getOrAddPool(essence, ScaleComponent);
    Pool.add(cameraP, cameraEntity, CameraComponent.new(true));
    var cameraSize = {
      // TODO. move somewhere (as deps or ctx)
      width: window.innerWidth,
      height: window.innerHeight,
    };
    // # POSITION
    Pool.add(
      positionP,
      cameraEntity,
      PositionComponent.new({
        x: boardSize.width / 2 - cameraSize.width / 2,
        y: boardSize.height / 2 - cameraSize.height / 2,
        z: 0,
      })
    );
    // # SIZE
    var sizeComponent = Pool.add(
      sizeP,
      cameraEntity,
      SizeComponent.new({
        width: cameraSize.width,
        height: cameraSize.height,
      })
    );
    // TODO. Move somewhere (as deps or ctx)
    window.addEventListener('resize', function () {
      sizeComponent.width = window.innerWidth;
      sizeComponent.height = window.innerHeight;
    });
    // # SCALE
    Pool.add(
      scaleP,
      cameraEntity,
      ScaleComponent.new({
        x: 1,
        y: 1,
      })
    );
    // # PAN MODE
    Pool.add(
      Essence.getOrAddPool(essence, PanModeComponent),
      cameraEntity,
      PanModeComponent.new({
        activated: false,
      })
    );
  };
  return function (world) {
    var essence = world.essence,
      ctx = world.ctx;
    var _a = ctx(),
      cameraEntity = _a.cameraEntity,
      boardSize = _a.boardSize;
    var initial = useIsInitial();
    if (initial) {
      console.log('INITIAL CAMERA');
      init(world);
      return;
    }
    // const panModeEntities = Essence.getEntitiesByComponents(essence, [PanModeComponent]);
    var positionCP = Essence.getOrAddPool(essence, PositionComponent);
    var sizeCP = Essence.getOrAddPool(essence, SizeComponent);
    var panModeP = Essence.getOrAddPool(essence, PanModeComponent);
    var cameraPositionC = Pool.get(positionCP, cameraEntity);
    var cameraSizeC = Pool.get(sizeCP, cameraEntity);
    var cameraPanModeC = Pool.get(panModeP, cameraEntity);
    if (cameraPanModeC.activated) {
      var newCameraPosition = __assign({}, cameraPositionC);
      var handPool = Essence.getOrAddPool(essence, FingerComponent);
      var fingerC = Pool.get(handPool, cameraEntity);
      if (fingerC.click.current.down) {
        var delta = Vector2.compareAndChange(fingerC.onCameraPosition.previous, fingerC.onCameraPosition.current);
        newCameraPosition.x -= delta.x;
        newCameraPosition.y -= delta.y;
      }
      // . Restrict
      if (
        newCameraPosition.x > 0 &&
        newCameraPosition.x + cameraSizeC.width < boardSize.width &&
        cameraPositionC.x !== newCameraPosition.x
      ) {
        cameraPositionC.x = newCameraPosition.x;
      }
      if (
        newCameraPosition.y > 0 &&
        newCameraPosition.y + cameraSizeC.height < boardSize.height &&
        cameraPositionC.y !== newCameraPosition.y
      ) {
        cameraPositionC.y = newCameraPosition.y;
      }
    }
  };
};

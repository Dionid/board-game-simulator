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
export const CameraSystem = () => {
  const init = ({ essence, ctx }) => {
    const { cameraEntity, boardSize } = ctx();
    const cameraP = Essence.getOrAddPool(essence, CameraComponent);
    const positionP = Essence.getOrAddPool(essence, PositionComponent);
    const sizeP = Essence.getOrAddPool(essence, SizeComponent);
    const scaleP = Essence.getOrAddPool(essence, ScaleComponent);
    Pool.add(cameraP, cameraEntity, CameraComponent.new(true));
    const cameraSize = {
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
    const sizeComponent = Pool.add(
      sizeP,
      cameraEntity,
      SizeComponent.new({
        width: cameraSize.width,
        height: cameraSize.height,
      })
    );
    // TODO. Move somewhere (as deps or ctx)
    window.addEventListener('resize', () => {
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
  return (world) => {
    const { essence, ctx } = world;
    const { cameraEntity, boardSize } = ctx();
    const initial = useIsInitial();
    if (initial) {
      console.log('INITIAL CAMERA');
      init(world);
      return;
    }
    // const panModeEntities = Essence.getEntitiesByComponents(essence, [PanModeComponent]);
    const positionCP = Essence.getOrAddPool(essence, PositionComponent);
    const sizeCP = Essence.getOrAddPool(essence, SizeComponent);
    const panModeP = Essence.getOrAddPool(essence, PanModeComponent);
    const cameraPositionC = Pool.get(positionCP, cameraEntity);
    const cameraSizeC = Pool.get(sizeCP, cameraEntity);
    const cameraPanModeC = Pool.get(panModeP, cameraEntity);
    if (cameraPanModeC.activated) {
      const newCameraPosition = {
        ...cameraPositionC,
      };
      const handPool = Essence.getOrAddPool(essence, FingerComponent);
      const fingerC = Pool.get(handPool, cameraEntity);
      if (fingerC.click.current.down) {
        const delta = Vector2.compareAndChange(fingerC.onCameraPosition.previous, fingerC.onCameraPosition.current);
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

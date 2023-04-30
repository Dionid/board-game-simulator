import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import { Size, Vector2 } from '../../../../math';
import {
  CameraComponent,
  PositionComponent,
  SizeComponent,
  ScaleComponent,
  FingerComponent,
  PanModeComponent,
} from '../../components';
import { EntityId } from '../../../../ecs/entity';

export const CameraSystem = (): System<{
  boardSize: Size;
  cameraEntity: EntityId;
}> => {
  return {
    init: ({ essence, ctx: { cameraEntity, boardSize } }) => {
      const cameraP = Essence.getOrAddPool(essence, CameraComponent);
      const positionP = Essence.getOrAddPool(essence, PositionComponent);
      const sizeP = Essence.getOrAddPool(essence, SizeComponent);
      const scaleP = Essence.getOrAddPool(essence, ScaleComponent);

      Pool.add(cameraP, cameraEntity, CameraComponent.new(undefined));

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
        })
      );

      // # SIZE
      const sizeComponent = SizeComponent.new(cameraSize);
      Pool.add(sizeP, cameraEntity, sizeComponent);

      // TODO. Move somewhere (as deps or ctx)
      window.addEventListener('resize', () => {
        sizeComponent.props.width = window.innerWidth;
        sizeComponent.props.height = window.innerHeight;
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
    },
    run: ({ essence, ctx: { cameraEntity, boardSize } }) => {
      // const panModeEntities = Essence.getEntitiesByComponents(essence, [PanModeComponent]);
      const positionCP = Essence.getOrAddPool(essence, PositionComponent);
      const sizeCP = Essence.getOrAddPool(essence, SizeComponent);
      const panModeP = Essence.getOrAddPool(essence, PanModeComponent);

      const cameraPositionC = Pool.get(positionCP, cameraEntity);
      const sizeC = Pool.get(sizeCP, cameraEntity);
      const panModeC = Pool.get(panModeP, cameraEntity);

      if (panModeC.props.activated) {
        const newCameraPosition: Vector2 = {
          ...cameraPositionC.props,
        };

        const handPool = Essence.getOrAddPool(essence, FingerComponent);
        const fingerC = Pool.get(handPool, cameraEntity);

        if (fingerC.props.click.current.down) {
          const delta = Vector2.compareAndChange(
            fingerC.props.onCameraPosition.previous,
            fingerC.props.onCameraPosition.current
          );
          newCameraPosition.x -= delta.x;
          newCameraPosition.y -= delta.y;
        }

        // . Restrict
        if (
          newCameraPosition.x > 0 &&
          newCameraPosition.x + sizeC.props.width < boardSize.width &&
          cameraPositionC.props.x !== newCameraPosition.x
        ) {
          cameraPositionC.props.x = newCameraPosition.x;
        }

        if (
          newCameraPosition.y > 0 &&
          newCameraPosition.y + sizeC.props.height < boardSize.height &&
          cameraPositionC.props.y !== newCameraPosition.y
        ) {
          cameraPositionC.props.y = newCameraPosition.y;
        }
      }

      // // . Pan mode
      // if (panModeEntities.length > 0) {

      // } else {
      //   // // . Hand near border feature
      //   // const margin = 20;
      //   // const velocity = timeDelta * 0.5;
      //   // // . Check that camera position is more than 0 and less than board size
      //   // if (handC.props.onCameraPosition.current.x > sizeC.props.width - margin) {
      //   //   // console.log('RIGHT');
      //   //   newPosition.x += velocity;
      //   // } else if (handC.props.onCameraPosition.current.x < margin) {
      //   //   // console.log('LEFT');
      //   //   newPosition.x -= velocity;
      //   // } else if (handC.props.onCameraPosition.current.y < margin) {
      //   //   // console.log('TOP');
      //   //   newPosition.y -= velocity;
      //   // } else if (handC.props.onCameraPosition.current.y > sizeC.props.height - margin) {
      //   //   // console.log('DOWN');
      //   //   newPosition.y += velocity;
      //   // }
      // }
    },
  };
};

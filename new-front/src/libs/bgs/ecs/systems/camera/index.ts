import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import { Size, Vector2 } from '../../../../math';
import {
  CameraComponent,
  PositionComponent,
  SizeComponent,
  ScaleComponent,
  PlayerComponent,
  FingerComponent,
  PanModeComponent,
} from '../../components';
import { UUID } from '../../../../branded-types';

export const CameraSystem = (): System<{
  boardSize: Size;
  playerId: UUID;
}> => {
  return {
    init: ({ essence, ctx }) => {
      const playerEntities = Essence.getEntitiesByComponents(essence, [PlayerComponent]);

      const playerEntity = playerEntities.find((playerEntityId) => {
        const playerPool = Essence.getOrAddPool(essence, PlayerComponent);

        const playerComp = Pool.get(playerPool, playerEntityId);

        return playerComp.props.id === ctx.playerId;
      });

      if (!playerEntity) {
        throw new Error('No player entity');
      }

      const cameraP = Essence.getOrAddPool(essence, CameraComponent);
      const positionP = Essence.getOrAddPool(essence, PositionComponent);
      const sizeP = Essence.getOrAddPool(essence, SizeComponent);
      const scaleP = Essence.getOrAddPool(essence, ScaleComponent);

      Pool.add(cameraP, playerEntity, CameraComponent.new(undefined));

      const cameraSize = {
        // TODO. move somewhere (as deps or ctx)
        width: window.innerWidth,
        height: window.innerHeight,
      };

      // # POSITION
      Pool.add(
        positionP,
        playerEntity,
        PositionComponent.new({
          x: ctx.boardSize.width / 2 - cameraSize.width / 2,
          y: ctx.boardSize.height / 2 - cameraSize.height / 2,
        })
      );

      // # SIZE
      const sizeComponent = SizeComponent.new(cameraSize);
      Pool.add(sizeP, playerEntity, sizeComponent);

      // TODO. Move somewhere (as deps or ctx)
      window.addEventListener('resize', () => {
        sizeComponent.props.width = window.innerWidth;
        sizeComponent.props.height = window.innerHeight;
      });

      // # SCALE
      Pool.add(
        scaleP,
        playerEntity,
        ScaleComponent.new({
          x: 1,
          y: 1,
        })
      );

      // # PAN MODE
      Pool.add(
        Essence.getOrAddPool(essence, PanModeComponent),
        playerEntity,
        PanModeComponent.new({
          activated: true,
        })
      );
    },
    run: ({ essence, ctx }) => {
      const playerEntities = Essence.getEntitiesByComponents(essence, [
        PlayerComponent,
        FingerComponent,
        CameraComponent,
        PanModeComponent,
      ]);

      const playerEntity = playerEntities.find((playerEntityId) => {
        const playerPool = Essence.getOrAddPool(essence, PlayerComponent);

        const playerComp = Pool.get(playerPool, playerEntityId);

        return playerComp.props.id === ctx.playerId;
      });

      if (!playerEntity) {
        throw new Error('Somehow no player entity');
      }

      // const panModeEntities = Essence.getEntitiesByComponents(essence, [PanModeComponent]);
      const positionCP = Essence.getOrAddPool(essence, PositionComponent);
      const sizeCP = Essence.getOrAddPool(essence, SizeComponent);
      const panModeP = Essence.getOrAddPool(essence, PanModeComponent);

      const cameraPositionC = Pool.get(positionCP, playerEntity);
      const sizeC = Pool.get(sizeCP, playerEntity);
      const panModeC = Pool.get(panModeP, playerEntity);

      const newCameraPosition: Vector2 = {
        x: cameraPositionC.props.x,
        y: cameraPositionC.props.y,
      };

      if (panModeC.props.activated) {
        const handPool = Essence.getOrAddPool(essence, FingerComponent);
        const fingerC = Pool.get(handPool, playerEntity);

        if (fingerC.props.click.current.down) {
          const delta = Vector2.compareAndChange(
            fingerC.props.onCameraPosition.previous,
            fingerC.props.onCameraPosition.current
          );
          newCameraPosition.x -= delta.x;
          newCameraPosition.y -= delta.y;
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

      // . Restrict
      if (newCameraPosition.x > 0 && newCameraPosition.x + sizeC.props.width < ctx.boardSize.width) {
        cameraPositionC.props.x = newCameraPosition.x;
      }

      if (newCameraPosition.y > 0 && newCameraPosition.y + sizeC.props.height < ctx.boardSize.height) {
        cameraPositionC.props.y = newCameraPosition.y;
      }
    },
  };
};

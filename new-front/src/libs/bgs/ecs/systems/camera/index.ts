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
    },
    run: ({ essence, ctx }) => {
      const playerEntities = Essence.getEntitiesByComponents(essence, [
        PlayerComponent,
        FingerComponent,
        CameraComponent,
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
      const handPool = Essence.getOrAddPool(essence, FingerComponent);

      // TODO. Filter only current player move
      const handC = Pool.get(handPool, playerEntity);
      const positionC = Pool.get(positionCP, playerEntity);
      const sizeC = Pool.get(sizeCP, playerEntity);

      const newPosition: Vector2 = {
        x: positionC.props.x,
        y: positionC.props.y,
      };

      // // . Pan mode
      // if (panModeEntities.length > 0) {
      //   if (handC.props.click.current.down) {
      //     const delta = Vector2.compareAndChange(
      //       handC.props.onCameraPosition.previous,
      //       handC.props.onCameraPosition.current
      //     );
      //     newPosition.x -= delta.x;
      //     newPosition.y -= delta.y;
      //   }
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
      if (newPosition.x > 0 && newPosition.x + sizeC.props.width < ctx.boardSize.width) {
        positionC.props.x = newPosition.x;
      }

      if (newPosition.y > 0 && newPosition.y + sizeC.props.height < ctx.boardSize.height) {
        positionC.props.y = newPosition.y;
      }
    },
  };
};

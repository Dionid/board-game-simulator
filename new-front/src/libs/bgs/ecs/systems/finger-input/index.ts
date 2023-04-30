import { System } from '../../../../ecs/system';
import { Essence } from '../../../../ecs/essence';
import { Pool } from '../../../../ecs/component';
import { CameraComponent, FingerComponent, PlayerComponent, PositionComponent, ScaleComponent } from '../../components';

export const FingerInputSystem = (): System => {
  const lastMouseData = {
    x: 0,
    y: 0,
    down: false,
  };

  return {
    init: async ({ essence, ctx }) => {
      const playerEntities = Essence.getEntitiesByComponents(essence, [PlayerComponent]);

      const playerEntity = playerEntities.find((playerEntityId) => {
        const playerPool = Essence.getOrAddPool(essence, PlayerComponent);

        const playerComp = Pool.get(playerPool, playerEntityId);

        return playerComp.props.id === ctx.playerId;
      });

      if (!playerEntity) {
        throw new Error('No player entity');
      }

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
    run: async ({ essence, ctx }) => {
      const playerEntities = Essence.getEntitiesByComponents(essence, [
        FingerComponent,
        PlayerComponent,
        CameraComponent,
        ScaleComponent,
      ]);

      const playerEntity = playerEntities.find((playerEntityId) => {
        const playerPool = Essence.getOrAddPool(essence, PlayerComponent);

        const playerComp = Pool.get(playerPool, playerEntityId);

        return playerComp.props.id === ctx.playerId;
      });

      if (!playerEntity) {
        throw new Error('Somehow no player entity');
      }

      const fingerCP = Essence.getOrAddPool(essence, FingerComponent);
      const positionCP = Essence.getOrAddPool(essence, PositionComponent);
      const scaleCP = Essence.getOrAddPool(essence, ScaleComponent);

      const cameraScaleC = Pool.get(scaleCP, playerEntity);
      const cameraPositionC = Pool.get(positionCP, playerEntity);
      const fingerC = Pool.get(fingerCP, playerEntity);

      // # Update
      fingerC.props.onCameraPosition.previous = fingerC.props.onCameraPosition.current;
      fingerC.props.onBoardPosition.previous = fingerC.props.onBoardPosition.current;
      fingerC.props.click.previous = fingerC.props.click.current;

      fingerC.props.onCameraPosition.current = {
        x: lastMouseData.x,
        y: lastMouseData.y,
      };

      fingerC.props.onBoardPosition.current = {
        x: lastMouseData.x / cameraScaleC.props.x + cameraPositionC.props.x,
        y: lastMouseData.y / cameraScaleC.props.y + cameraPositionC.props.y,
      };

      fingerC.props.click.current = {
        down: lastMouseData.down,
      };
    },
  };
};

import { memo } from 'react';
import { BgsWorld } from '../../libs/bgs/ecs';
import { Size } from '../../libs/math';
import { useEcsComponent } from '../../libs/ecs/react';
import { EntityId } from '../../libs/ecs/entity';
import { ReactPositionComponent, ReactSizeComponent } from '../../libs/ecs/react/components';

const coef = 30;

// const MinimapObject = memo((props: { world: BgsWorld; entity: EntityId }) => {
//   const { entity, world } = props;

//   const position = useEcsComponent(entity, { x: 0, y: 0 }, 'ReactPositionComponent', world);
//   const size = useEcsComponent(entity, { width: 0, height: 0 }, 'ReactSizeComponent', world);

//   return (
//     <div
//       key={entity}
//       style={{
//         width: size.width / coef,
//         height: size.height / coef,
//         position: 'absolute',
//         backgroundColor: 'blue',
//         opacity: 0.5,
//         top: position.y / coef,
//         left: position.x / coef,
//       }}
//     />
//   );
// });

export const MiniMapArea = memo(({ world, playerEntity }: { world: BgsWorld; playerEntity: EntityId }) => {
  const position = useEcsComponent(world, playerEntity, { x: 0, y: 0 }, ReactPositionComponent);
  const size = useEcsComponent(world, playerEntity, { width: 0, height: 0 }, ReactSizeComponent);

  return (
    <div
      style={{
        width: size.width / coef,
        height: size.height / coef,
        outline: '2px red solid',
        position: 'absolute',
        top: position.y / coef,
        left: position.x / coef,
      }}
    />
  );
});

export const Minimap = memo(
  ({
    world,
    boardSize,
    playerEntity,
  }: {
    forceUpdateState: string;
    world: BgsWorld;
    boardSize: Size;
    playerEntity: EntityId;
  }) => {
    // const goCP = Essence.getOrAddPool(world.essence, 'GameObjectComponent');

    return (
      <div
        style={{ display: 'flex', alignItems: 'center', textAlign: 'center', position: 'fixed', bottom: 15, left: 15 }}
      >
        <div
          style={{
            width: boardSize.width / coef,
            height: boardSize.height / coef,
            backgroundColor: '#fff',
            position: 'relative',
          }}
        >
          <MiniMapArea world={world} playerEntity={playerEntity} />
          {/* {Object.keys(goCP.data).map((entity) => {
            return <MinimapObject key={entity} world={world} entity={entity as EntityId} />;
          })} */}
        </div>
      </div>
    );
  }
);

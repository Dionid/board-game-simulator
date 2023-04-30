import { memo } from 'react';
import { BgsWorld } from '../../libs/bgs/ecs';
import { Size } from '../../libs/math';
import { EntityId } from '../../libs/ecs/entity';
import { useSyncedStore } from '@syncedstore/react';
import { essenceStore } from '../../apps/main/store';
import { Pool } from '../../libs/ecs/component';
import { Essence } from '../../libs/ecs/essence';
import { PositionComponent, SizeComponent } from '../../libs/bgs/ecs/components';

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

export const MiniMapArea = memo(({ playerEntity }: { playerEntity: EntityId }) => {
  const essence = useSyncedStore(essenceStore);

  const position = Pool.get(Essence.getOrAddPool(essence, PositionComponent), playerEntity);

  const size = Pool.get(Essence.getOrAddPool(essence, SizeComponent), playerEntity);

  console.log('position, size', position.props.x, position.props.y, size.props.width, size.props.height);

  return (
    <div
      style={{
        width: size.props.width / coef,
        height: size.props.height / coef,
        outline: '2px red solid',
        position: 'absolute',
        top: position.props.y / coef,
        left: position.props.x / coef,
      }}
    />
  );
});

export const Minimap = memo(
  ({ world, boardSize, playerEntity }: { world: BgsWorld; boardSize: Size; playerEntity: EntityId }) => {
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
          <MiniMapArea playerEntity={playerEntity} />
          {/* {Object.keys(goCP.data).map((entity) => {
            return <MinimapObject key={entity} world={world} entity={entity as EntityId} />;
          })} */}
        </div>
      </div>
    );
  }
);

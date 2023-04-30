import { memo } from 'react';
import { BgsWorld } from '../../libs/bgs/ecs';
import { Size } from '../../libs/math';

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

export const Minimap = memo(({ world, boardSize }: { world: BgsWorld; boardSize: Size }) => {
  // const position = useEcsComponent(world, playerEntity, { x: 0, y: 0 }, 'ReactPositionComponent');
  // const size = useEcsComponent(world, playerEntity, { width: 0, height: 0 }, 'ReactSizeComponent');

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
        {/* <div
            style={{
              width: size.width / coef,
              height: size.height / coef,
              outline: '2px red solid',
              position: 'absolute',
              top: position.y / coef,
              left: position.x / coef,
            }}
          /> */}
        {/* {Object.keys(goCP.data).map((entity) => {
            return <MinimapObject key={entity} world={world} entity={entity as EntityId} />;
          })} */}
      </div>
    </div>
  );
});

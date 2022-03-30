import { BgsIgnitor } from '../../../libs/bgs/ecs';
import { useEcsComponent } from '../../../libs/ecs/react';
import { Size } from '../../../libs/math';
import { memo } from 'react';
import { EntityId } from '../../../libs/ecs/entity';

export const Minimap = memo((props: { ignitor: BgsIgnitor; playerEntity: EntityId; boardSize: Size }) => {
  const { ignitor, playerEntity } = props;

  const position = useEcsComponent(playerEntity, { x: 0, y: 0 }, 'ReactPositionComponent', ignitor);

  // const top = position.y
  // const left = position.x

  // console.log("RERENDER", playerEntity, position)

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', textAlign: 'center', position: 'fixed', bottom: 15, left: 15 }}
    >
      <div style={{ width: 140, height: 104, backgroundColor: '#fff', position: 'relative' }}>
        <div
          style={{
            width: 30,
            height: 20,
            border: '2px red solid',
            position: 'absolute',
            top: position.y,
            left: position.x,
          }}
        />
      </div>
    </div>
  );
});

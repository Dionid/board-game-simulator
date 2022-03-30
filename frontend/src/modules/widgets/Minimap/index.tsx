import { BgsIgnitor } from '../../../libs/bgs/ecs';
import { useEcsComponent } from '../../../libs/ecs/react';
import { Size } from '../../../libs/math';
import { memo } from 'react';
import { EntityId } from '../../../libs/ecs/entity';

const coef = 57;

export const Minimap = memo((props: { ignitor: BgsIgnitor; playerEntity: EntityId; boardSize: Size }) => {
  const { ignitor, playerEntity, boardSize } = props;

  const position = useEcsComponent(playerEntity, { x: 0, y: 0 }, 'ReactPositionComponent', ignitor);
  const size = useEcsComponent(playerEntity, { width: 0, height: 0 }, 'ReactSizeComponent', ignitor);

  const top = position.y / coef;
  const left = position.x / coef;

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
        <div
          style={{
            width: size.width / coef,
            height: size.height / coef,
            border: '2px red solid',
            position: 'absolute',
            top,
            left,
          }}
        />
      </div>
    </div>
  );
});

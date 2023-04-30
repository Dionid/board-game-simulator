import { Layer, Stage } from 'react-konva';
import { memo } from 'react';
import { Essence } from '../../libs/ecs/essence';
import { useSyncedStore } from '@syncedstore/react';
import { essencePoolsStore } from '../../apps/main/store';
import { PositionComponent, ScaleComponent } from '../../libs/bgs/ecs/components';
import { Pool } from '../../libs/ecs/component';
import { EntityId } from '../../libs/ecs/entity';

const surfaceWidth = window.innerWidth;
const surfaceHeight = window.innerHeight;

export const Board = memo(({ cameraEntity }: { cameraEntity: EntityId }) => {
  const essence = useSyncedStore(essencePoolsStore);

  const scale = Pool.get(Essence.getOrAddPool(essence, ScaleComponent), cameraEntity);
  const position = Pool.get(Essence.getOrAddPool(essence, PositionComponent), cameraEntity);

  return (
    <Stage
      style={{ backgroundColor: '#e1e1e1' }}
      width={surfaceWidth}
      height={surfaceHeight}
      scale={{ ...scale.props }}
    >
      <Layer x={-position.props.x} y={-position.props.y}>
        {/* {depthC.data.list.map((entity) => {
            return <ECSCustomImage key={entity} entity={entity as EntityId} world={world} />;
          })} */}
      </Layer>
    </Stage>
  );
});

import { Layer, Stage } from 'react-konva';
import { memo } from 'react';
import { Essence } from '../../libs/ecs/essence';
import { useSyncedStore } from '@syncedstore/react';
import { essencePoolsStore } from '../../apps/main/store';
import {
  GameObjectComponent,
  ImageComponent,
  PositionComponent,
  ScaleComponent,
  SizeComponent,
} from '../../libs/bgs/ecs/components';
import { Pool } from '../../libs/ecs/component';
import { EntityId } from '../../libs/ecs/entity';
import { ECSCustomImage } from '../CustomImage/ecs';

const surfaceWidth = window.innerWidth;
const surfaceHeight = window.innerHeight;

export const Board = memo(({ cameraEntity }: { cameraEntity: EntityId }) => {
  const essence = useSyncedStore(essencePoolsStore);

  const scale = Pool.get(Essence.getOrAddPool(essence, ScaleComponent), cameraEntity);
  const position = Pool.get(Essence.getOrAddPool(essence, PositionComponent), cameraEntity);

  const gos = Essence.getEntitiesByComponents(essence, [
    GameObjectComponent,
    PositionComponent,
    SizeComponent,
    ImageComponent,
  ]);

  return (
    <Stage style={{ backgroundColor: '#e1e1e1' }} width={surfaceWidth} height={surfaceHeight} scale={{ ...scale }}>
      <Layer x={-position.x} y={-position.y}>
        {gos.map((entity) => {
          return <ECSCustomImage essence={essence} key={entity} entity={entity} />;
        })}
      </Layer>
    </Stage>
  );
});

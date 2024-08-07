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

export const Board = memo(({ cameraEntity }: { cameraEntity: EntityId }) => {
  const essence = useSyncedStore(essencePoolsStore);

  const scale = Pool.get(Essence.getOrAddPool(essence, ScaleComponent), cameraEntity);
  const position = Pool.get(Essence.getOrAddPool(essence, PositionComponent), cameraEntity);
  const size = Pool.get(Essence.getOrAddPool(essence, SizeComponent), cameraEntity);

  const gos = Essence.getEntitiesByComponents(essence, [
    GameObjectComponent,
    PositionComponent,
    SizeComponent,
    ImageComponent,
  ]);

  const positionComponentPool = Essence.getOrAddPool(essence, PositionComponent);

  gos.sort((a, b) => {
    const aPosition = Pool.get(positionComponentPool, a);
    const bPosition = Pool.get(positionComponentPool, b);
    return aPosition.z - bPosition.z;
  });

  return (
    <Stage style={{ backgroundColor: '#e1e1e1' }} width={size.width} height={size.height} scale={{ ...scale }}>
      <Layer x={-position.x} y={-position.y}>
        {gos.map((entity) => {
          return <ECSCustomImage essence={essence} key={entity} entity={entity} />;
        })}
      </Layer>
    </Stage>
  );
});

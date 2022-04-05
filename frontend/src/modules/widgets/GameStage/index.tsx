import { Layer, Stage } from 'react-konva';
import { ECSCustomImage } from '../CustomImage/ecs';
import { EntityId } from '../../../libs/ecs/entity';
import React, { memo } from 'react';
import { BgsWorld } from '../../../libs/bgs/ecs';
import { useEcsComponent } from '../../../libs/ecs/react';
import { Essence } from '../../../libs/ecs/essence';
import { ReactPositionComponentName, ReactScaleComponentName } from '../../../libs/bgs/ecs/components';

export const GameStage = memo(
  ({ world, playerEntity }: { forceUpdateState: string; world: BgsWorld; playerEntity: EntityId }) => {
    const surfaceWidth = window.innerWidth;
    const surfaceHeight = window.innerHeight;

    const position = useEcsComponent(playerEntity, { x: 0, y: 0 }, ReactPositionComponentName, world);
    const scale = useEcsComponent(playerEntity, { x: 1, y: 1 }, ReactScaleComponentName, world);

    const gameObjectComponentPool = Essence.getOrAddPool(world.essence, 'GameObjectComponent');

    return (
      <Stage style={{ backgroundColor: '#e1e1e1' }} width={surfaceWidth} height={surfaceHeight} scale={scale}>
        <Layer x={-position.x} y={-position.y}>
          {Object.keys(gameObjectComponentPool.data).map((entity) => {
            return <ECSCustomImage key={entity} entity={entity as EntityId} world={world} />;
          })}
        </Layer>
      </Stage>
    );
  }
);

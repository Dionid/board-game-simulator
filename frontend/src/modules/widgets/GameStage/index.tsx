import { Layer, Stage } from 'react-konva';
import { ECSCustomImage } from '../CustomImage/ui/ecs';
import { EntityId } from '../../../libs/ecs/entity';
import React, { memo } from 'react';
import { BgsIgnitor } from '../../../libs/bgs/ecs';
import { useEcsComponent } from '../../../libs/ecs/react';
import { World } from '../../../libs/ecs/world';

export const GameStage = memo(
  ({ ignitor, playerEntity }: { forceUpdateState: string; ignitor: BgsIgnitor; playerEntity: EntityId }) => {
    const surfaceWidth = window.innerWidth;
    const surfaceHeight = window.innerHeight;

    const position = useEcsComponent(playerEntity, { x: 0, y: 0 }, 'ReactPositionComponent', ignitor);
    const gameObjectComponentPool = World.getOrAddPool(ignitor.world, 'GameObjectComponent');

    return (
      <Stage style={{ backgroundColor: '#e1e1e1' }} width={surfaceWidth} height={surfaceHeight}>
        <Layer x={-position.x} y={-position.y}>
          {Object.keys(gameObjectComponentPool.data).map((entity) => {
            return <ECSCustomImage key={entity} entity={entity as EntityId} ignitor={ignitor} />;
          })}
        </Layer>
      </Stage>
    );
  }
);
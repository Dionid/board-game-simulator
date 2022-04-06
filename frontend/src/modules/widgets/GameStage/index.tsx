import { Layer, Stage } from 'react-konva';
import { ECSCustomImage } from '../CustomImage/ecs';
import { EntityId } from '../../../libs/ecs/entity';
import React, { memo } from 'react';
import { BgsWorld } from '../../../libs/bgs/ecs';
import { useEcsComponent } from '../../../libs/ecs/react';
import { Essence } from '../../../libs/ecs/essence';
import {
  DepthComponentName,
  GameMapComponentName,
  ReactPositionComponentName,
  ReactScaleComponentName,
} from '../../../libs/bgs/ecs/components';
import { Pool } from '../../../libs/ecs/component';

export const GameStage = memo(
  ({ world, playerEntity }: { forceUpdateState: string; world: BgsWorld; playerEntity: EntityId }) => {
    const surfaceWidth = window.innerWidth;
    const surfaceHeight = window.innerHeight;

    const position = useEcsComponent(playerEntity, { x: 0, y: 0 }, ReactPositionComponentName, world);
    const scale = useEcsComponent(playerEntity, { x: 1, y: 1 }, ReactScaleComponentName, world);

    const depthCP = Essence.getOrAddPool(world.essence, DepthComponentName);
    const depthE = Object.keys(depthCP.data).map((entity) => entity)[0] as EntityId;
    const depthC = Pool.get(depthCP, depthE);

    const gameMapCP = Essence.getOrAddPool(world.essence, GameMapComponentName);

    const gameMapEntities: EntityId[] = depthC.data.list.filter((entity) => gameMapCP.data[entity]);
    const otherEntities: EntityId[] = depthC.data.list.filter((entity) => !gameMapCP.data[entity]);

    return (
      <Stage style={{ backgroundColor: '#e1e1e1' }} width={surfaceWidth} height={surfaceHeight} scale={scale}>
        <Layer x={-position.x} y={-position.y}>
          {gameMapEntities.map((entity) => {
            return <ECSCustomImage key={entity} entity={entity as EntityId} world={world} />;
          })}
        </Layer>
        <Layer x={-position.x} y={-position.y}>
          {otherEntities.map((entity) => {
            return <ECSCustomImage key={entity} entity={entity as EntityId} world={world} />;
          })}
        </Layer>
      </Stage>
    );
  }
);

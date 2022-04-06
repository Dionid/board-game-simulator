import { EntityId } from '../../../libs/ecs/entity';
import { BgsWorld } from '../../../libs/bgs/ecs';
import { useEcsComponent } from '../../../libs/ecs/react';
import { CustomImage } from './index';
import React from 'react';
import { Group } from 'react-konva';
import { Html } from 'react-konva-utils';
import {
  DecrementCurrentHealthEventComponentName,
  HealthMeterComponentName,
  IncrementCurrentHealthEventComponentName,
  ReactHealthMeterComponentName,
  ReactImageComponentName,
  ReactPositionComponentName,
  ReactSizeComponentName,
} from '../../../libs/bgs/ecs/components';
import { Essence } from '../../../libs/ecs/essence';
import { ComponentId, Pool } from '../../../libs/ecs/component';
import { Size } from '../../../libs/math';

function calcClipFunc(ctx: any, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export const ECSHealthMeter = React.memo((props: { entity: EntityId; world: BgsWorld; size: Size }) => {
  const { entity, world, size } = props;
  const healthMeterCP = Essence.getOrAddPool(world.essence, HealthMeterComponentName);
  const healthMeterC = Pool.tryGet(healthMeterCP, entity);

  const health = useEcsComponent(entity, { current: 0 }, ReactHealthMeterComponentName, world);

  if (healthMeterC && size.width) {
    return (
      <Html
        transform={true}
        // transformFunc={(transformAttrs) => {
        //   console.log("width", size.width)
        //   return {
        //     ...transformAttrs,
        //     x: (transformAttrs.x + size.width/2 - 17) * transformAttrs.scaleX,
        //     y: (transformAttrs.y + size.width/2 - 70) * transformAttrs.scaleY,
        //   }
        // }}
        divProps={{
          style: {
            position: 'absolute',
            color: '#fff',
            fontSize: '30px',
            fontWeight: 'bold',
            textAlign: 'center',
            width: `${size.width}px`,
          },
        }}
      >
        <div
          onClick={() => {
            const incrementCurrentHealthCP = Essence.getOrAddPool(
              world.essence,
              IncrementCurrentHealthEventComponentName
            );
            Pool.add(incrementCurrentHealthCP, EntityId.new(), {
              id: ComponentId.new(),
              name: IncrementCurrentHealthEventComponentName,
              data: {
                healthMeterEntityId: entity,
              },
            });
          }}
          style={{ cursor: 'pointer' }}
        >
          +
        </div>
        <div>{health.current}</div>
        <div
          onClick={() => {
            const decrementCurrentHealthCP = Essence.getOrAddPool(
              world.essence,
              DecrementCurrentHealthEventComponentName
            );
            Pool.add(decrementCurrentHealthCP, EntityId.new(), {
              id: ComponentId.new(),
              name: DecrementCurrentHealthEventComponentName,
              data: {
                healthMeterEntityId: entity,
              },
            });
          }}
          style={{ cursor: 'pointer' }}
        >
          -
        </div>
      </Html>
    );
  }

  return null;
});

export const ECSCustomImage = React.memo((props: { entity: EntityId; world: BgsWorld }) => {
  const { entity, world } = props;

  const image = useEcsComponent(entity, { url: '' }, ReactImageComponentName, world);
  const position = useEcsComponent(entity, { x: 0, y: 0 }, ReactPositionComponentName, world);
  const size = useEcsComponent(entity, { width: 0, height: 0 }, ReactSizeComponentName, world);

  return (
    <Group clipFunc={(ctx: any) => calcClipFunc(ctx, position.x, position.y, size.width, size.height, 3)}>
      <Group x={position.x} y={position.y}>
        <ECSHealthMeter size={size} world={world} entity={entity} />
        <CustomImage
          key={entity}
          isSelected={false}
          onSelect={() => {}}
          url={image.url}
          width={size.width}
          height={size.height}
          // x={position.x}
          // y={position.y}
          // stroke={'#fff'}
          // strokeWidth={3}
        />
      </Group>
    </Group>
  );
});

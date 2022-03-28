import { EntityId } from '../../../../libs/ecs/entity';
import { BgsIgnitor } from '../../../../libs/bgs/ecs';
import { useEcsComponent } from '../../../../libs/ecs/react';
import { CustomImage } from './index';
import React from 'react';
import { Group } from 'react-konva';

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

export const ECSCustomImage = React.memo((props: { entity: EntityId; ignitor: BgsIgnitor }) => {
  const { entity, ignitor } = props;

  const image = useEcsComponent(entity, { url: '' }, 'ReactImageComponent', ignitor);
  const position = useEcsComponent(entity, { x: 0, y: 0 }, 'ReactPositionComponent', ignitor);
  const size = useEcsComponent(entity, { width: 0, height: 0 }, 'ReactSizeComponent', ignitor);

  return (
    <Group clipFunc={(ctx: any) => calcClipFunc(ctx, position.x, position.y, size.width, size.height, 3)}>
      <CustomImage
        key={entity}
        isSelected={false}
        onSelect={() => {}}
        url={image.url}
        width={size.width}
        height={size.height}
        x={position.x}
        y={position.y}
        stroke={'#fff'}
        strokeWidth={3}
      />
    </Group>
  );
});

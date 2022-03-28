import { EntityId } from '../../../../libs/ecs/entity';
import { BgsIgnitor } from '../../../../libs/bgs/ecs';
import { useEcsComponent } from '../../../../libs/ecs/react';
import { CustomImage } from './index';
import React from 'react';

export const ECSCustomImage = React.memo((props: { entity: EntityId; ignitor: BgsIgnitor }) => {
  const { entity, ignitor } = props;

  const image = useEcsComponent(entity, { url: '' }, 'ReactImageComponent', ignitor);
  const position = useEcsComponent(entity, { x: 0, y: 0 }, 'ReactPositionComponent', ignitor);
  const size = useEcsComponent(entity, { width: 0, height: 0 }, 'ReactSizeComponent', ignitor);

  return (
    <CustomImage
      key={entity}
      isSelected={false}
      onSelect={() => {}}
      url={image.url}
      width={size.width}
      height={size.height}
      x={position.x}
      y={position.y}
    />
  );
});

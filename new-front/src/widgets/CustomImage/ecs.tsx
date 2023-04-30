import { CustomImage } from './index';
import { Group } from 'react-konva';
import { Pool } from '../../libs/ecs/component';
import { Essence, EssencePools } from '../../libs/ecs/essence';
import { EntityId } from '../../libs/ecs/entity';
import { ImageComponent, PositionComponent, SizeComponent } from '../../libs/bgs/ecs/components';

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

// export const ECSHealthMeter = React.memo((props: { entity: EntityId; world: BgsWorld; size: Size }) => {
//   const { entity, world, size } = props;
//   const healthMeterCP = Essence.getOrAddPool(world.essence, HealthMeterComponentName);
//   const healthMeterC = Pool.tryGet(healthMeterCP, entity);

//   const health = useEcsComponent(entity, { current: 0 }, ReactHealthMeterComponentName, world);

//   if (healthMeterC && size.width) {
//     return (
//       <Html
//         transform={true}
//         // transformFunc={(transformAttrs) => {
//         //   console.log("width", size.width)
//         //   return {
//         //     ...transformAttrs,
//         //     x: (transformAttrs.x + size.width/2 - 17) * transformAttrs.scaleX,
//         //     y: (transformAttrs.y + size.width/2 - 70) * transformAttrs.scaleY,
//         //   }
//         // }}
//         divProps={{
//           style: {
//             position: 'absolute',
//             color: '#fff',
//             fontSize: '30px',
//             fontWeight: 'bold',
//             textAlign: 'center',
//             width: `${size.width}px`,
//           },
//         }}
//       >
//         <div
//           onClick={() => {
//             const incrementCurrentHealthCP = Essence.getOrAddPool(
//               world.essence,
//               IncrementCurrentHealthEventComponentName
//             );
//             Pool.add(incrementCurrentHealthCP, EntityId.new(), {
//               id: ComponentId.new(),
//               name: IncrementCurrentHealthEventComponentName,
//               data: {
//                 healthMeterEntityId: entity,
//               },
//             });
//           }}
//           style={{ cursor: 'pointer' }}
//         >
//           +
//         </div>
//         <div>{health.current}</div>
//         <div
//           onClick={() => {
//             const decrementCurrentHealthCP = Essence.getOrAddPool(
//               world.essence,
//               DecrementCurrentHealthEventComponentName
//             );
//             Pool.add(decrementCurrentHealthCP, EntityId.new(), {
//               id: ComponentId.new(),
//               name: DecrementCurrentHealthEventComponentName,
//               data: {
//                 healthMeterEntityId: entity,
//               },
//             });
//           }}
//           style={{ cursor: 'pointer' }}
//         >
//           -
//         </div>
//       </Html>
//     );
//   }

//   return null;
// });

export const ECSCustomImage = ({ entity, essence }: { entity: EntityId; essence: EssencePools<any> }) => {
  const position = Pool.get(Essence.getOrAddPool(essence, PositionComponent), entity);
  const image = Pool.get(Essence.getOrAddPool(essence, ImageComponent), entity);
  const size = Pool.get(Essence.getOrAddPool(essence, SizeComponent), entity);

  return (
    <Group
      clipFunc={(ctx: any) =>
        calcClipFunc(ctx, position.props.x, position.props.y, size.props.width, size.props.height, 3)
      }
    >
      <Group x={position.props.x} y={position.props.y}>
        {/* <ECSHealthMeter size={size} world={world} entity={entity} /> */}
        <CustomImage
          key={entity}
          isSelected={false}
          onSelect={() => {}}
          url={image.props.url}
          width={size.props.width}
          height={size.props.height}
          // x={position.x}
          // y={position.y}
          // stroke={'#fff'}
          // strokeWidth={3}
        />
      </Group>
    </Group>
  );
};

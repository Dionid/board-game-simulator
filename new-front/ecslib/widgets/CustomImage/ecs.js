var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
import { jsx as _jsx } from 'react/jsx-runtime';
import { CustomImage } from './index';
import { Group } from 'react-konva';
import { Pool } from '../../libs/ecs/component';
import { Essence } from '../../libs/ecs/essence';
import { ImageComponent, PositionComponent, SizeComponent } from '../../libs/bgs/ecs/components';
function calcClipFunc(ctx, x, y, width, height, radius) {
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
export var ECSCustomImage = function (_a) {
  var entity = _a.entity,
    essence = _a.essence;
  var position = Pool.get(Essence.getOrAddPool(essence, PositionComponent), entity);
  var image = Pool.get(Essence.getOrAddPool(essence, ImageComponent), entity);
  var size = Pool.get(Essence.getOrAddPool(essence, SizeComponent), entity);
  return _jsx(
    Group,
    __assign(
      {
        clipFunc: function (ctx) {
          return calcClipFunc(ctx, position.x, position.y, size.width, size.height, 3);
        },
      },
      {
        children: _jsx(
          Group,
          __assign(
            { x: position.x, y: position.y },
            {
              children: _jsx(
                CustomImage,
                { isSelected: false, onSelect: function () {}, url: image.url, width: size.width, height: size.height },
                entity
              ),
            }
          )
        ),
      }
    )
  );
};

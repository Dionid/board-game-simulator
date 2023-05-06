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
import { ECSCustomImage } from '../CustomImage/ecs';
export var Board = memo(function (_a) {
  var cameraEntity = _a.cameraEntity;
  var essence = useSyncedStore(essencePoolsStore);
  var scale = Pool.get(Essence.getOrAddPool(essence, ScaleComponent), cameraEntity);
  var position = Pool.get(Essence.getOrAddPool(essence, PositionComponent), cameraEntity);
  var size = Pool.get(Essence.getOrAddPool(essence, SizeComponent), cameraEntity);
  var gos = Essence.getEntitiesByComponents(essence, [
    GameObjectComponent,
    PositionComponent,
    SizeComponent,
    ImageComponent,
  ]);
  var positionComponentPool = Essence.getOrAddPool(essence, PositionComponent);
  gos.sort(function (a, b) {
    var aPosition = Pool.get(positionComponentPool, a);
    var bPosition = Pool.get(positionComponentPool, b);
    return aPosition.z - bPosition.z;
  });
  return _jsx(
    Stage,
    __assign(
      { style: { backgroundColor: '#e1e1e1' }, width: size.width, height: size.height, scale: __assign({}, scale) },
      {
        children: _jsx(
          Layer,
          __assign(
            { x: -position.x, y: -position.y },
            {
              children: gos.map(function (entity) {
                return _jsx(ECSCustomImage, { essence: essence, entity: entity }, entity);
              }),
            }
          )
        ),
      }
    )
  );
});

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
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { memo } from 'react';
import { useSyncedStore } from '@syncedstore/react';
import { essencePoolsStore } from '../../apps/main/store';
import { Pool } from '../../libs/ecs/component';
import { Essence } from '../../libs/ecs/essence';
import { GameObjectComponent, ImageComponent, PositionComponent, SizeComponent } from '../../libs/bgs/ecs/components';
var coef = 30;
var MinimapObject = memo(function (_a) {
  var entity = _a.entity,
    essence = _a.essence;
  var position = Pool.get(Essence.getOrAddPool(essence, PositionComponent), entity);
  var size = Pool.get(Essence.getOrAddPool(essence, SizeComponent), entity);
  return _jsx(
    'div',
    {
      style: {
        width: size.width / coef,
        height: size.height / coef,
        position: 'absolute',
        backgroundColor: 'blue',
        opacity: 0.5,
        top: position.y / coef,
        left: position.x / coef,
      },
    },
    entity
  );
});
export var MiniMapArea = memo(function (_a) {
  var playerEntity = _a.playerEntity;
  var essence = useSyncedStore(essencePoolsStore);
  var position = Pool.get(Essence.getOrAddPool(essence, PositionComponent), playerEntity);
  var size = Pool.get(Essence.getOrAddPool(essence, SizeComponent), playerEntity);
  // console.log('position, size', position.x, position.y, size.width, size.height);
  return _jsx('div', {
    style: {
      width: size.width / coef,
      height: size.height / coef,
      outline: '2px red solid',
      position: 'absolute',
      top: position.y / coef,
      left: position.x / coef,
    },
  });
});
export var Minimap = memo(function (_a) {
  var boardSize = _a.boardSize,
    playerEntity = _a.playerEntity;
  var essence = useSyncedStore(essencePoolsStore);
  var gos = Essence.getEntitiesByComponents(essence, [
    GameObjectComponent,
    PositionComponent,
    SizeComponent,
    ImageComponent,
  ]);
  return _jsx(
    'div',
    __assign(
      {
        style: { display: 'flex', alignItems: 'center', textAlign: 'center', position: 'fixed', bottom: 15, left: 15 },
      },
      {
        children: _jsxs(
          'div',
          __assign(
            {
              style: {
                width: boardSize.width / coef,
                height: boardSize.height / coef,
                backgroundColor: '#fff',
                position: 'relative',
              },
            },
            {
              children: [
                _jsx(MiniMapArea, { playerEntity: playerEntity }),
                gos.map(function (entity) {
                  return _jsx(MinimapObject, { entity: entity, essence: essence }, entity);
                }),
              ],
            }
          )
        ),
      }
    )
  );
});

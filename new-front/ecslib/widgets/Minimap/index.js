import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { memo } from 'react';
import { useSyncedStore } from '@syncedstore/react';
import { essencePoolsStore } from '../../apps/main/store';
import { Pool } from '../../libs/ecs/component';
import { Essence } from '../../libs/ecs/essence';
import { GameObjectComponent, ImageComponent, PositionComponent, SizeComponent } from '../../libs/bgs/ecs/components';
const coef = 30;
const MinimapObject = memo(({ entity, essence }) => {
  const position = Pool.get(Essence.getOrAddPool(essence, PositionComponent), entity);
  const size = Pool.get(Essence.getOrAddPool(essence, SizeComponent), entity);
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
export const MiniMapArea = memo(({ playerEntity }) => {
  const essence = useSyncedStore(essencePoolsStore);
  const position = Pool.get(Essence.getOrAddPool(essence, PositionComponent), playerEntity);
  const size = Pool.get(Essence.getOrAddPool(essence, SizeComponent), playerEntity);
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
export const Minimap = memo(({ boardSize, playerEntity }) => {
  const essence = useSyncedStore(essencePoolsStore);
  const gos = Essence.getEntitiesByComponents(essence, [
    GameObjectComponent,
    PositionComponent,
    SizeComponent,
    ImageComponent,
  ]);
  return _jsx('div', {
    style: { display: 'flex', alignItems: 'center', textAlign: 'center', position: 'fixed', bottom: 15, left: 15 },
    children: _jsxs('div', {
      style: {
        width: boardSize.width / coef,
        height: boardSize.height / coef,
        backgroundColor: '#fff',
        position: 'relative',
      },
      children: [
        _jsx(MiniMapArea, { playerEntity: playerEntity }),
        gos.map((entity) => {
          return _jsx(MinimapObject, { entity: entity, essence: essence }, entity);
        }),
      ],
    }),
  });
});

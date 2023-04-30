import { memo } from 'react';
import { Size } from '../../libs/math';
import { EntityId } from '../../libs/ecs/entity';
import { useSyncedStore } from '@syncedstore/react';
import { essencePoolsStore } from '../../apps/main/store';
import { Pool } from '../../libs/ecs/component';
import { Essence, EssencePools } from '../../libs/ecs/essence';
import { GameObjectComponent, ImageComponent, PositionComponent, SizeComponent } from '../../libs/bgs/ecs/components';

const coef = 30;

const MinimapObject = memo(({ entity, essence }: { entity: EntityId; essence: EssencePools<any> }) => {
  const position = Pool.get(Essence.getOrAddPool(essence, PositionComponent), entity);
  const size = Pool.get(Essence.getOrAddPool(essence, SizeComponent), entity);

  return (
    <div
      key={entity}
      style={{
        width: size.props.width / coef,
        height: size.props.height / coef,
        position: 'absolute',
        backgroundColor: 'blue',
        opacity: 0.5,
        top: position.props.y / coef,
        left: position.props.x / coef,
      }}
    />
  );
});

export const MiniMapArea = memo(({ playerEntity }: { playerEntity: EntityId }) => {
  const essence = useSyncedStore(essencePoolsStore);

  const position = Pool.get(Essence.getOrAddPool(essence, PositionComponent), playerEntity);

  const size = Pool.get(Essence.getOrAddPool(essence, SizeComponent), playerEntity);

  console.log('position, size', position.props.x, position.props.y, size.props.width, size.props.height);

  return (
    <div
      style={{
        width: size.props.width / coef,
        height: size.props.height / coef,
        outline: '2px red solid',
        position: 'absolute',
        top: position.props.y / coef,
        left: position.props.x / coef,
      }}
    />
  );
});

export const Minimap = memo(({ boardSize, playerEntity }: { boardSize: Size; playerEntity: EntityId }) => {
  const essence = useSyncedStore(essencePoolsStore);

  const gos = Essence.getEntitiesByComponents(essence, [
    GameObjectComponent,
    PositionComponent,
    SizeComponent,
    ImageComponent,
  ]);

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', textAlign: 'center', position: 'fixed', bottom: 15, left: 15 }}
    >
      <div
        style={{
          width: boardSize.width / coef,
          height: boardSize.height / coef,
          backgroundColor: '#fff',
          position: 'relative',
        }}
      >
        <MiniMapArea playerEntity={playerEntity} />
        {gos.map((entity) => {
          return <MinimapObject key={entity} entity={entity} essence={essence} />;
        })}
      </div>
    </div>
  );
});

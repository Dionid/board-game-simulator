import { BgsWorld } from '../../../libs/bgs/ecs';
import { useEcsComponent } from '../../../libs/ecs/react';
import { Size } from '../../../libs/math';
import React, { memo } from 'react';
import { EntityId } from '../../../libs/ecs/entity';
import { Essence } from '../../../libs/ecs/essence';

const coef = 30;

const MinimapObject = memo((props: { world: BgsWorld; entity: EntityId }) => {
  const { entity, world } = props;

  const position = useEcsComponent(entity, { x: 0, y: 0 }, 'ReactPositionComponent', world);
  const size = useEcsComponent(entity, { width: 0, height: 0 }, 'ReactSizeComponent', world);

  return (
    <div
      key={entity}
      style={{
        width: size.width / coef,
        height: size.height / coef,
        position: 'absolute',
        backgroundColor: 'blue',
        opacity: 0.5,
        top: position.y / coef,
        left: position.x / coef,
      }}
    />
  );
});

export const Minimap = memo(
  (props: { forceUpdateState: string; world: BgsWorld; playerEntity: EntityId; boardSize: Size }) => {
    const { world, playerEntity, boardSize } = props;

    const position = useEcsComponent(playerEntity, { x: 0, y: 0 }, 'ReactPositionComponent', world);
    const size = useEcsComponent(playerEntity, { width: 0, height: 0 }, 'ReactSizeComponent', world);

    const goCP = Essence.getOrAddPool(world.essence, 'GameObjectComponent');

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
          <div
            style={{
              width: size.width / coef,
              height: size.height / coef,
              outline: '2px red solid',
              position: 'absolute',
              top: position.y / coef,
              left: position.x / coef,
            }}
          />
          {Object.keys(goCP.data).map((entity) => {
            return <MinimapObject key={entity} world={world} entity={entity as EntityId} />;
          })}
        </div>
      </div>
    );
  }
);

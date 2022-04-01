import { EntityId } from '../../../libs/ecs/entity';
import Menu from '@mui/material/Menu';
import React, { FC } from 'react';
import { Essence } from '../../../libs/ecs/essence';
import { ComponentId, Pool } from '../../../libs/ecs/component';
import { ListItemIcon, MenuItem } from '@mui/material';
import { BgsWorld } from '../../../libs/bgs/ecs';
import { Square } from '../../../libs/math';
import { PersonAdd } from '@mui/icons-material';
import { HeroSets, MapId, SetId } from '../../../libs/bgs/games/unmatched';
import { SpawnGameMapEventComponentName, SpawnHeroSetEventComponentName } from '../../../libs/bgs/ecs/components';
import { v4 } from 'uuid';

export const ContextMenu: FC<{ world: BgsWorld; heroSets: HeroSets }> = (props) => {
  const { children, world, heroSets } = props;

  // CONTEXT MENU
  const [contextMenu, setContextMenu] = React.useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            x: event.clientX - 2,
            y: event.clientY - 4,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const spawnMap = () => {
    if (!contextMenu) {
      throw new Error(`Context menu must be not emtpy`);
    }
    const spawnGameMapComponentPool = Essence.getOrAddPool(world.essence, SpawnGameMapEventComponentName);
    Pool.add(spawnGameMapComponentPool, EntityId.new(), {
      name: SpawnGameMapEventComponentName,
      id: ComponentId.new(),
      data: {
        url: '/maps/soho.png',
        mapId: MapId.new(),
        x: contextMenu.x,
        y: contextMenu.y,
      },
    });
    handleClose();
  };

  const spawnHeroSet = (setId: SetId) => {
    if (!contextMenu) {
      throw new Error(`Context menu must be not emtpy`);
    }
    const spawnHeroSetComponentPool = Essence.getOrAddPool(world.essence, SpawnHeroSetEventComponentName);
    Pool.add(spawnHeroSetComponentPool, EntityId.new(), {
      name: SpawnHeroSetEventComponentName,
      id: ComponentId.new(),
      data: {
        setId,
        x: contextMenu.x,
        y: contextMenu.y,
      },
    });
    handleClose();
  };

  const contextMenuActions = () => {
    const actions: JSX.Element[] = [];
    const emptyActions = [
      <MenuItem key={v4()} onClick={spawnMap}>
        <ListItemIcon>
          <PersonAdd fontSize="small" />
        </ListItemIcon>
        Add Soho map
      </MenuItem>,
      Object.keys(heroSets).map((id) => {
        return (
          <MenuItem key={id} onClick={() => spawnHeroSet(id as SetId)}>
            <ListItemIcon>
              <PersonAdd fontSize="small" />
            </ListItemIcon>
            Add {heroSets[id].name} Hero Set
          </MenuItem>
        );
      }),
    ];

    if (!contextMenu) {
      return emptyActions;
    }

    const positionEntities = Essence.filter(world.essence, [
      'GameObjectComponent',
      'PositionComponent',
      'SizeComponent',
    ]);
    const positionComponentPool = Essence.getOrAddPool(world.essence, 'PositionComponent');
    const sizeComponentPool = Essence.getOrAddPool(world.essence, 'SizeComponent');

    const playerMouseEntities = Essence.filter(world.essence, ['PlayerComponent', 'OwnerComponent', 'HandComponent']);
    const handPool = Essence.getOrAddPool(world.essence, 'HandComponent');
    const playerMouseComponent = Pool.get(handPool, playerMouseEntities[0]);

    const mouseOnEntities: EntityId[] = [];

    positionEntities.forEach((entity) => {
      const positionComponent = Pool.get(positionComponentPool, entity);
      const sizeComponent = Pool.get(sizeComponentPool, entity);
      // . Is inside object zone, including camera position
      if (
        Square.isInside(
          { ...positionComponent.data, ...sizeComponent.data },
          playerMouseComponent.data.onBoardPosition.current
        )
      ) {
        mouseOnEntities.push(entity);
      }
    });

    if (mouseOnEntities.length === 0) {
      return emptyActions;
    }

    let lastZIndex = 0;
    const maxZPositionEntity = mouseOnEntities.reduce((prev, cur) => {
      const positionC = Pool.get(positionComponentPool, cur);

      if (positionC.data.z > lastZIndex) {
        lastZIndex = positionC.data.z;
        return cur;
      }

      lastZIndex = positionC.data.z;
      return prev;
    });

    if (maxZPositionEntity) {
      const deletableCP = Essence.getOrAddPool(world.essence, 'DeletableComponent');
      if (Pool.tryGet(deletableCP, maxZPositionEntity)) {
        // . DELETE BUTTON
        actions.push(
          <MenuItem
            key={maxZPositionEntity + ':delete_button'}
            onClick={() => {
              handleClose();
              Essence.destroyEntity(world.essence, maxZPositionEntity);
              world.ctx.forceUpdate();
            }}
          >
            Delete
          </MenuItem>
        );
      }

      // . (UN)LOCK BUTTON
      const lockableComponentPool = Essence.getOrAddPool(world.essence, 'LockableComponent');
      const lockableComponent = Pool.tryGet(lockableComponentPool, maxZPositionEntity);

      if (lockableComponent) {
        const isLockedComponentPool = Essence.getOrAddPool(world.essence, 'IsLockedComponent');
        const isLockedComponent = Pool.tryGet(isLockedComponentPool, maxZPositionEntity);

        if (isLockedComponent) {
          actions.push(
            <MenuItem
              key={maxZPositionEntity + ':lock_button'}
              onClick={() => {
                handleClose();
                Pool.delete(isLockedComponentPool, maxZPositionEntity);
              }}
            >
              Unlock
            </MenuItem>
          );
        } else {
          actions.push(
            <MenuItem
              key={maxZPositionEntity + ':lock_button'}
              onClick={() => {
                handleClose();
                Pool.add(isLockedComponentPool, maxZPositionEntity, {
                  id: ComponentId.new(),
                  name: 'IsLockedComponent',
                  data: {},
                });
              }}
            >
              Lock
            </MenuItem>
          );
        }
      }
    }

    return actions;
  };

  return (
    <div onContextMenu={handleContextMenu}>
      {children}
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu !== null ? { top: contextMenu.y, left: contextMenu.x } : undefined}
      >
        {contextMenuActions()}
      </Menu>
    </div>
  );
};

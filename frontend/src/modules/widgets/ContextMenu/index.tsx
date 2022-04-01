import { EntityId } from '../../../libs/ecs/entity';
import Menu from '@mui/material/Menu';
import React, { FC } from 'react';
import { Essence } from '../../../libs/ecs/essence';
import { ComponentId, Pool } from '../../../libs/ecs/component';
import { MenuItem } from '@mui/material';
import { BgsIgnitor } from '../../../libs/bgs/ecs';
import { v4 } from 'uuid';
import { Square } from '../../../libs/math';

export const ContextMenu: FC<{ ignitor: BgsIgnitor }> = (props) => {
  const { children, ignitor } = props;

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

  const contextMenuActions = () => {
    const actions: JSX.Element[] = [];
    const emptyActions = [<MenuItem key={v4()}>No actions</MenuItem>];

    if (!contextMenu) {
      return emptyActions;
    }

    const positionEntities = Essence.filter(ignitor.essence, [
      'GameObjectComponent',
      'PositionComponent',
      'SizeComponent',
    ]);
    const positionComponentPool = Essence.getOrAddPool(ignitor.essence, 'PositionComponent');
    const sizeComponentPool = Essence.getOrAddPool(ignitor.essence, 'SizeComponent');

    const playerMouseEntities = Essence.filter(ignitor.essence, ['PlayerComponent', 'OwnerComponent', 'HandComponent']);
    const handPool = Essence.getOrAddPool(ignitor.essence, 'HandComponent');
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
      const deletableCP = Essence.getOrAddPool(ignitor.essence, 'DeletableComponent');
      if (Pool.tryGet(deletableCP, maxZPositionEntity)) {
        // . DELETE BUTTON
        actions.push(
          <MenuItem
            key={maxZPositionEntity + ':delete_button'}
            onClick={() => {
              handleClose();
              Essence.destroyEntity(ignitor.essence, maxZPositionEntity);
              ignitor.ctx.forceUpdate();
            }}
          >
            Delete
          </MenuItem>
        );
      }

      // . (UN)LOCK BUTTON
      const lockableComponentPool = Essence.getOrAddPool(ignitor.essence, 'LockableComponent');
      const lockableComponent = Pool.tryGet(lockableComponentPool, maxZPositionEntity);

      if (lockableComponent) {
        const isLockedComponentPool = Essence.getOrAddPool(ignitor.essence, 'IsLockedComponent');
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

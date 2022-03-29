import { EntityId } from '../../../libs/ecs/entity';
import Menu from '@mui/material/Menu';
import React, { FC } from 'react';
import { World } from '../../../libs/ecs/world';
import { ComponentId, Pool } from '../../../libs/ecs/component';
import { MenuItem } from '@mui/material';
import { BgsIgnitor } from '../../../libs/bgs/ecs';

export const ContextMenu: FC<{ ignitor: BgsIgnitor }> = (props) => {
  const { children, ignitor } = props;

  // CONTEXT MENU
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
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

    if (!contextMenu) {
      return actions;
    }

    const positionEntities = World.filter(ignitor.world, ['PositionComponent', 'SizeComponent']);
    const positionComponentPool = World.getOrAddPool(ignitor.world, 'PositionComponent');
    const sizeComponentPool = World.getOrAddPool(ignitor.world, 'SizeComponent');

    const mouseOnEntities: EntityId[] = [];

    positionEntities.forEach((entity) => {
      const positionComponent = Pool.get(positionComponentPool, entity);
      const sizeComponent = Pool.get(sizeComponentPool, entity);
      if (
        contextMenu.mouseX > positionComponent.data.x &&
        contextMenu.mouseX < positionComponent.data.x + sizeComponent.data.width &&
        contextMenu.mouseY > positionComponent.data.y &&
        contextMenu.mouseY < positionComponent.data.y + sizeComponent.data.height
      ) {
        mouseOnEntities.push(entity);
      }
    });

    if (mouseOnEntities.length === 0) {
      return actions;
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
      actions.push(
        <MenuItem
          key={maxZPositionEntity + ':delete_button'}
          onClick={() => {
            handleClose();
            World.destroyEntity(ignitor.world, maxZPositionEntity);
          }}
        >
          Delete
        </MenuItem>
      );

      const lockableComponentPool = World.getOrAddPool(ignitor.world, 'LockableComponent');
      const lockableComponent = Pool.tryGet(lockableComponentPool, maxZPositionEntity);

      if (lockableComponent) {
        const isLockedComponentPool = World.getOrAddPool(ignitor.world, 'IsLockedComponent');
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
        anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
      >
        {contextMenuActions()}
      </Menu>
    </div>
  );
};

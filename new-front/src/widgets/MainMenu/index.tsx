import React, { memo, useState } from 'react';
import { Box, IconButton, ListItemIcon, MenuItem, Tooltip } from '@mui/material';
import Menu from '@mui/material/Menu';
import { PersonAdd } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import PanToolIcon from '@mui/icons-material/PanTool';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { BgsWorld } from '../../libs/bgs/ecs';
import { Essence } from '../../libs/ecs/essence';
import { PanModeComponent } from '../../libs/bgs/ecs/components';
import { Pool } from '../../libs/ecs/component';
import { useEventListener } from '../../libs/react/hooks/use-event-listener';
import { EntityId } from '../../libs/ecs/entity';
import { ZoomInEvent, ZoomOutEvent } from '../../libs/bgs/ecs/events';

export const MainMenu = memo(({ world, playerEntity }: { world: BgsWorld; playerEntity: EntityId }) => {
  const [mode, setMode] = useState<'pan' | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePanIconButtonClick = () => {
    const panModeCP = Essence.getOrAddPool(world.essence, PanModeComponent);
    const panMode = Pool.get(panModeCP, playerEntity);

    if (mode === 'pan') {
      setMode(null);
      panMode.props.activated = false;
    } else {
      setMode('pan');
      panMode.props.activated = true;
    }
  };

  const handler = ({ key }: WindowEventMap['keydown']) => {
    if (key === 'p') {
      handlePanIconButtonClick();
    }
  };

  useEventListener('keydown', handler);

  const onZoomOutClick = () => {
    Essence.addEvent(world.essence, ZoomOutEvent.new(undefined));
  };
  const onZoomInClick = () => {
    Essence.addEvent(world.essence, ZoomInEvent.new(undefined));
  };

  return (
    <>
      <Box
        sx={{ display: 'flex', alignItems: 'center', textAlign: 'center', position: 'fixed', bottom: 15, right: 15 }}
      >
        <Tooltip title="Zoom out">
          <IconButton size="large" onClick={onZoomOutClick} sx={{ ml: 2, backgroundColor: '#bdbdbd' }}>
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom in">
          <IconButton size="large" onClick={onZoomInClick} sx={{ ml: 2, backgroundColor: '#bdbdbd' }}>
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Pan mode">
          <IconButton
            size="large"
            onClick={handlePanIconButtonClick}
            sx={{ ml: 2, backgroundColor: mode === 'pan' ? '#b388da' : '#bdbdbd' }}
          >
            <PanToolIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Main menu">
          <IconButton
            onClick={handleMenuButtonClick}
            size="large"
            sx={{ ml: 2, backgroundColor: '#bdbdbd' }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
      >
        <MenuItem>
          <ListItemIcon>
            <PersonAdd fontSize="small" />
          </ListItemIcon>
          No actions
        </MenuItem>
      </Menu>
    </>
  );
});

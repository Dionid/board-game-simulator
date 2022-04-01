import { HeroSets, MapId, SetId } from '../../../libs/bgs/games/unmatched';
import { BgsIgnitor } from '../../../libs/bgs/ecs';
import React, { memo, useState } from 'react';
import { World } from '../../../libs/ecs/world';
import { ComponentId, Pool } from '../../../libs/ecs/component';
import { EntityId } from '../../../libs/ecs/entity';
import { Box, IconButton, ListItemIcon, MenuItem, Tooltip } from '@mui/material';
import Menu from '@mui/material/Menu';
import { PersonAdd } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import PanToolIcon from '@mui/icons-material/PanTool';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { useEventListener } from '../../../libs/react/hooks/use-event-listener';

export const MainMenu = memo(({ heroSets, ignitor }: { heroSets: HeroSets; ignitor: BgsIgnitor }) => {
  const [mode, setMode] = useState<'pan' | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const spawnMap = () => {
    const spawnGameMapComponentPool = World.getOrAddPool(ignitor.world, 'SpawnGameMapComponent');
    Pool.add(spawnGameMapComponentPool, EntityId.new(), {
      name: 'SpawnGameMapComponent',
      id: ComponentId.new(),
      data: {
        url: '/maps/soho.png',
        mapId: MapId.new(),
      },
    });
  };

  const handlePanIconButtonClick = () => {
    const panModeCP = World.getOrAddPool(ignitor.world, 'PanModeComponent');
    if (mode === 'pan') {
      setMode(null);
      const entities = World.filter(ignitor.world, ['PanModeComponent']);
      entities.forEach((entity) => {
        Pool.delete(panModeCP, entity);
      });
    } else {
      setMode('pan');
      Pool.add(panModeCP, EntityId.new(), {
        id: ComponentId.new(),
        name: 'PanModeComponent',
        data: {},
      });
    }
  };

  const handler = ({ key }: WindowEventMap['keydown']) => {
    if (key === 'p') {
      handlePanIconButtonClick();
    }
  };

  useEventListener('keydown', handler);

  const spawnHeroSet = (setId: SetId) => {
    const spawnHeroSetComponentPool = World.getOrAddPool(ignitor.world, 'SpawnHeroSetComponent');
    Pool.add(spawnHeroSetComponentPool, EntityId.new(), {
      name: 'SpawnHeroSetComponent',
      id: ComponentId.new(),
      data: {
        setId,
      },
    });
  };

  const onZoomOutClick = () => {
    const zoomOutCP = World.getOrAddPool(ignitor.world, 'ZoomOutEventComponent');
    Pool.add(zoomOutCP, EntityId.new(), {
      id: ComponentId.new(),
      name: 'ZoomOutEventComponent',
      data: {},
    });
  };
  const onZoomInClick = () => {
    const zoomInCP = World.getOrAddPool(ignitor.world, 'ZoomInEventComponent');
    Pool.add(zoomInCP, EntityId.new(), {
      id: ComponentId.new(),
      name: 'ZoomInEventComponent',
      data: {},
    });
  };

  return (
    <React.Fragment>
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
        <MenuItem onClick={spawnMap}>
          <ListItemIcon>
            <PersonAdd fontSize="small" />
          </ListItemIcon>
          Add Soho map
        </MenuItem>
        {Object.keys(heroSets).map((id) => {
          return (
            <MenuItem key={id} onClick={() => spawnHeroSet(id as SetId)}>
              <ListItemIcon>
                <PersonAdd fontSize="small" />
              </ListItemIcon>
              Add {heroSets[id].name} Hero Set
            </MenuItem>
          );
        })}
      </Menu>
    </React.Fragment>
  );
});

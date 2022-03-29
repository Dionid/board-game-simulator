import { HeroSets, MapId, SetId } from '../../../libs/bgs/games/unmatched';
import { BgsIgnitor } from '../../../libs/bgs/ecs';
import React from 'react';
import { World } from '../../../libs/ecs/world';
import { ComponentId, Pool } from '../../../libs/ecs/component';
import { EntityId } from '../../../libs/ecs/entity';
import { Box, IconButton, ListItemIcon, MenuItem, Tooltip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import { PersonAdd } from '@mui/icons-material';

export const MainMenu = ({ heroSets, ignitor }: { heroSets: HeroSets; ignitor: BgsIgnitor }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
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

  return (
    <React.Fragment>
      <Box
        sx={{ display: 'flex', alignItems: 'center', textAlign: 'center', position: 'fixed', bottom: 15, right: 15 }}
      >
        <Tooltip title="Main menu">
          <IconButton
            onClick={handleClick}
            size="large"
            sx={{ ml: 2, backgroundColor: '#bdbdbd' }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
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
};

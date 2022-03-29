import React, { useEffect, useState } from 'react';
import { Layer, Stage } from 'react-konva';
import CssBaseline from '@mui/material/CssBaseline';
import Konva from 'konva';
import { Box, IconButton, ListItemIcon, MenuItem, Tooltip } from '@mui/material';
import Menu from '@mui/material/Menu';
import { BgsIgnitor, BgsIgnitorCtx } from '../../libs/bgs/ecs';
import { Ignitor } from '../../libs/ecs/ignitor';
import { World } from '../../libs/ecs/world';
import { ComponentId, Pool } from '../../libs/ecs/component';
import { EntityId } from '../../libs/ecs/entity';
import { ChangeReactPositionSystem } from '../../libs/bgs/ecs/systems/change-react-position-system';
import { ChangeReactImageSystem } from '../../libs/bgs/ecs/systems/change-react-image-system';
import { SpawnGameMapSystem } from '../../libs/bgs/ecs/systems/spawn-game-map-system';
import { ChangeReactSizeSystem } from '../../libs/bgs/ecs/systems/change-react-size';
import { ECSCustomImage } from '../../modules/widgets/CustomImage/ui/ecs';
import { SpawnHeroSystem } from '../../libs/bgs/ecs/systems/spawn-hero-system';
import { MouseInputSystem } from '../../libs/bgs/ecs/systems/mouse-input';
import { PlayerSystem } from '../../libs/bgs/ecs/systems/player';
import { DragSystem } from '../../libs/bgs/ecs/systems/drag';
import { SelectSystem } from '../../libs/bgs/ecs/systems/select';
import { useForceUpdate } from '../../libs/react/hooks/use-force-update';
import { HeroSets, MapId, SetId } from '../../libs/bgs/games/unmatched';
import { PersonAdd } from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { SpawnHeroSetSystem } from '../../libs/bgs/ecs/systems/spawn-hero-set-system';
import { SpawnGameObjectSystem } from '../../libs/bgs/ecs/systems/spawn-game-object';
import { SpawnSidekickEventSystem } from '../../libs/bgs/ecs/systems/spawn-sidekick-system';
import { SpawnDeckEventSystem } from '../../libs/bgs/ecs/systems/spawn-deck-system';
import { SpawnCardEventSystem } from '../../libs/bgs/ecs/systems/spawn-card-system';
import { SpawnHealthMeterEventSystem } from '../../libs/bgs/ecs/systems/spawn-health-meter-system';
import { SpawnRuleCardEventSystem } from '../../libs/bgs/ecs/systems/spawn-rule-card-system';

const ignitor: BgsIgnitor = {
  world: {
    pools: {},
  },
  ctx: {} as BgsIgnitorCtx,
  systems: [
    // INIT
    PlayerSystem(),

    // INPUT
    MouseInputSystem(),

    // INTERACTION
    SelectSystem(),
    DragSystem(),

    // SPAWN
    SpawnGameMapSystem(),
    SpawnHeroSetSystem(),
    SpawnHeroSystem(),
    SpawnSidekickEventSystem(),
    SpawnDeckEventSystem(),
    SpawnCardEventSystem(),
    SpawnRuleCardEventSystem(),
    SpawnHealthMeterEventSystem(),

    // SPAWN GAME OBJECT
    SpawnGameObjectSystem(),

    // SPAWN REACT GAME OBJECT
    // ...

    // RENDER REACT
    ChangeReactPositionSystem(),
    ChangeReactImageSystem(),
    ChangeReactSizeSystem(),
  ],
};

// @ts-ignore
window.ignitor = ignitor;
// @ts-ignore
window.Ignitor = Ignitor;
// @ts-ignore
window.World = World;

const initIgnitor = async () => {
  await Ignitor.init(ignitor);

  let lastTimeStamp = new Date();
  const run = async () => {
    const newTimeStamp = new Date();
    await Ignitor.run(ignitor, newTimeStamp.getMilliseconds() - lastTimeStamp.getMilliseconds());
    lastTimeStamp = newTimeStamp;
    requestAnimationFrame(run);
  };

  requestAnimationFrame(run);
};

const MainMenu = ({ heroSets, ignitor }: { heroSets: HeroSets; ignitor: BgsIgnitor }) => {
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

function App() {
  const surfaceWidth = window.innerWidth;
  const surfaceHeight = window.innerHeight;

  const forceUpdate = useForceUpdate();
  const [heroSets] = useState(HeroSets);
  const [, selectShape] = useState<string | null>(null);

  const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  useEffect(() => {
    Ignitor.addToCtx(ignitor, 'heroSets', heroSets);
  }, [heroSets]);

  useEffect(() => {
    initIgnitor();
    setInterval(() => {
      forceUpdate();
    }, 1000);
  }, []);

  console.log('RERENDER');

  const gameObjectComponentPool = World.getOrAddPool(ignitor.world, 'GameObjectComponent');

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
    }

    return actions;
  };

  return (
    <div>
      <CssBaseline />
      <div onContextMenu={handleContextMenu}>
        <Stage
          style={{ backgroundColor: '#e1e1e1' }}
          width={surfaceWidth}
          height={surfaceHeight}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
        >
          <Layer>
            {Object.keys(gameObjectComponentPool.data).map((entity) => {
              return <ECSCustomImage key={entity} entity={entity as EntityId} ignitor={ignitor} />;
            })}
          </Layer>
        </Stage>
        <Menu
          open={contextMenu !== null}
          onClose={handleClose}
          anchorReference="anchorPosition"
          anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
        >
          {contextMenuActions()}
        </Menu>
      </div>
      <MainMenu ignitor={ignitor} heroSets={heroSets} />
    </div>
  );
}

export default App;

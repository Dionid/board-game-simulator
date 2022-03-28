import React, { useEffect } from 'react';
import { Layer, Stage } from 'react-konva';
import CssBaseline from '@mui/material/CssBaseline';
import Konva from 'konva';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import { BgsIgnitor } from '../../libs/bgs/ecs';
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

const ignitor: BgsIgnitor = {
  world: {
    pools: {},
  },
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
    SpawnHeroSystem(),

    // RENDER REACT
    ChangeReactPositionSystem(),
    ChangeReactImageSystem(),
    ChangeReactSizeSystem(),
  ],
};

const initIgnitor = async () => {
  await Ignitor.init(ignitor);

  const run = async () => {
    await Ignitor.run(ignitor);
    requestAnimationFrame(run);
  };
  requestAnimationFrame(run);
};

function App() {
  const surfaceWidth = window.innerWidth;
  const surfaceHeight = window.innerHeight;

  const [, selectShape] = React.useState<string | null>(null);

  const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  useEffect(() => {
    initIgnitor();
    setInterval(() => {
      selectShape(Math.random() + '');
    }, 1000);
  }, []);

  console.log('RERENDER');

  const actions = [
    {
      icon: <FileCopyIcon />,
      name: 'Add map',
      onClick: async () => {
        const spawnGameMapComponentPool = World.getOrAddPool(ignitor.world, 'SpawnGameMapComponent');
        Pool.add(spawnGameMapComponentPool, EntityId.new(), {
          name: 'SpawnGameMapComponent',
          id: ComponentId.new(),
          data: {
            url: 'https://downloader.disk.yandex.ru/preview/dfe66cd35d8feabf8ce64c40339d342e3f91b6c2e70db5c0046745aee0fc7b0a/623f62e7/HTA3saKP7S9n3UVUFPbneRLOs38Aexzy74peiw68-Bqu1Ghp-2pZ66iNDKp7lyv_THLyuC5YhZtrQDywSWC10Q%3D%3D?uid=0&filename=Screenshot%202022-03-26%20at%2018.00.35.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=0&tknv=v2&size=2878x1478',
          },
        });
      },
    },
    {
      icon: <SaveIcon />,
      name: 'Save',
      onClick: async () => {
        const spawnHeroComponentPool = World.getOrAddPool(ignitor.world, 'SpawnHeroComponent');
        Pool.add(spawnHeroComponentPool, EntityId.new(), {
          name: 'SpawnHeroComponent',
          id: ComponentId.new(),
          data: {
            url: 'https://downloader.disk.yandex.ru/preview/161897aa02b8194c76d656eef6457102eb834eaf8f5ae87bd6a187bb82cdb4fd/623f6aaa/UD-u8vK1z1fLXA14AVIV7W9G13sooEQOAswJRV651SmGSoZFp5wTl-y7PHaF0ne9Z3yDPVHa8Xri9lPONPSPaA%3D%3D?uid=0&filename=Screenshot%202022-03-26%20at%2018.33.34.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=0&tknv=v2&size=2048x2048',
          },
        });
      },
    },
    { icon: <PrintIcon />, name: 'Print' },
    { icon: <ShareIcon />, name: 'Share' },
  ];

  const reactGameMapComponentPool = World.getOrAddPool(ignitor.world, 'ReactGameMapComponent');
  const reactHeroComponentPool = World.getOrAddPool(ignitor.world, 'ReactHeroComponent');

  return (
    <div>
      <CssBaseline />
      <Stage width={surfaceWidth} height={surfaceHeight} onMouseDown={checkDeselect} onTouchStart={checkDeselect}>
        <Layer>
          {Object.keys(reactGameMapComponentPool.data).map((entity) => {
            return <ECSCustomImage key={entity} entity={entity as EntityId} ignitor={ignitor} />;
          })}
        </Layer>
        <Layer>
          {Object.keys(reactHeroComponentPool.data).map((entity) => {
            return <ECSCustomImage key={entity} entity={entity as EntityId} ignitor={ignitor} />;
          })}
        </Layer>
      </Stage>
      <SpeedDial
        ariaLabel="SpeedDial basic example"
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        {actions.map((action) => (
          <SpeedDialAction key={action.name} icon={action.icon} tooltipTitle={action.name} onClick={action.onClick} />
        ))}
      </SpeedDial>
    </div>
  );
}

export default App;

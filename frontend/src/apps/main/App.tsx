import React, { useState } from 'react';
import { Layer, Stage } from 'react-konva';
import CssBaseline from '@mui/material/CssBaseline';
import Konva from 'konva';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import { CustomImage } from '../../modules/widgets/CustomImage/ui';
import { World } from '../../libs/ecs/world';
import {
  BgsIgnitor,
  CreateReactMapComponent,
  SpawnGameMapComponent,
  SpawnGameMapSystem,
} from '../../libs/bgs/ecs-test';
import { ComponentId, ComponentsPool } from '../../libs/ecs/component';
import { Ignitor } from '../../libs/ecs/ignitor';
import { EntityId } from '../../libs/ecs/entity';

function App() {
  const surfaceWidth = window.innerWidth;
  const surfaceHeight = window.innerHeight;

  const [selectedId, selectShape] = React.useState<string | null>(null);

  const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  const [ignitor, setIgnitor] = useState<BgsIgnitor>({
    world: { pools: {} },
    systems: [SpawnGameMapSystem()],
  });

  const actions = [
    {
      icon: <FileCopyIcon />,
      name: 'Add map',
      onClick: async () => {
        const [spawnComponentPool, newWorld] = World.getOrAddPool<SpawnGameMapComponent>(
          ignitor.world,
          'SpawnGameMapComponent'
        );
        const newWorldS = World.addPool(
          newWorld,
          ComponentsPool.addComponent<SpawnGameMapComponent>(spawnComponentPool, EntityId.new(), {
            name: 'SpawnGameMapComponent',
            id: ComponentId.new(),
            data: {
              url: 'https://downloader.disk.yandex.ru/preview/dfe66cd35d8feabf8ce64c40339d342e3f91b6c2e70db5c0046745aee0fc7b0a/623f62e7/HTA3saKP7S9n3UVUFPbneRLOs38Aexzy74peiw68-Bqu1Ghp-2pZ66iNDKp7lyv_THLyuC5YhZtrQDywSWC10Q%3D%3D?uid=0&filename=Screenshot%202022-03-26%20at%2018.00.35.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=0&tknv=v2&size=2878x1478',
              name: 'Default name',
            },
          })
        );

        const newIgnitor = await Ignitor.update({
          ...ignitor,
          world: newWorldS,
        });
        setIgnitor(newIgnitor);
      },
    },
    { icon: <SaveIcon />, name: 'Save' },
    { icon: <PrintIcon />, name: 'Print' },
    { icon: <ShareIcon />, name: 'Share' },
  ];

  return (
    <div>
      <CssBaseline />
      <Stage width={surfaceWidth} height={surfaceHeight} onMouseDown={checkDeselect} onTouchStart={checkDeselect}>
        <Layer>
          {World.getPool<CreateReactMapComponent>(ignitor.world, 'CreateReactMapComponent')?.components.map(
            (component) => {
              return (
                <CustomImage
                  key={component.id}
                  url={component.data.url}
                  isSelected={selectedId === component.id}
                  onSelect={() => {
                    selectShape(component.id);
                  }}
                  // width={componentsByName['SizeComponent'].width}
                  // height={componentsByName['SizeComponent'].height}
                  // x={componentsByName['PositionComponent'].x}
                  // y={componentsByName['PositionComponent'].y}
                />
              );
            }
          )}
        </Layer>
        <Layer>
          <CustomImage
            url={
              'https://downloader.disk.yandex.ru/preview/161897aa02b8194c76d656eef6457102eb834eaf8f5ae87bd6a187bb82cdb4fd/623f6aaa/UD-u8vK1z1fLXA14AVIV7W9G13sooEQOAswJRV651SmGSoZFp5wTl-y7PHaF0ne9Z3yDPVHa8Xri9lPONPSPaA%3D%3D?uid=0&filename=Screenshot%202022-03-26%20at%2018.33.34.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=0&tknv=v2&size=2048x2048'
            }
            isSelected={'champ' === selectedId}
            onSelect={() => {
              selectShape('champ');
            }}
            width={60}
            height={100}
          />
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

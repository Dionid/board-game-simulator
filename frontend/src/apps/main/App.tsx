import React from 'react';
import { Layer, Stage } from 'react-konva';
import CssBaseline from '@mui/material/CssBaseline';
import Konva from 'konva';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import { CustomImage } from '../../modules/widgets/CustomImage/ui';

function App() {
  const surfaceWidth = window.innerWidth;
  const surfaceHeight = window.innerHeight;

  const [selectedId, selectShape] = React.useState<string | null>(null);

  const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  // const [entityStorage, setEntityStorage] = useState<BgsEntityStorage>({
  //   byId: {},
  //   allIds: [],
  //   byComponents: {}
  // });

  const actions = [
    {
      icon: <FileCopyIcon />,
      name: 'Add map',
      onClick: () => {
        // const gameBoard = GameMapEntity.new(
        //   'https://downloader.disk.yandex.ru/preview/dfe66cd35d8feabf8ce64c40339d342e3f91b6c2e70db5c0046745aee0fc7b0a/623f62e7/HTA3saKP7S9n3UVUFPbneRLOs38Aexzy74peiw68-Bqu1Ghp-2pZ66iNDKp7lyv_THLyuC5YhZtrQDywSWC10Q%3D%3D?uid=0&filename=Screenshot%202022-03-26%20at%2018.00.35.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=0&tknv=v2&size=2878x1478'
        // );
        // setEntityStorage(EntityStorage.addEntity(entityStorage, gameBoard));
      },
    },
    { icon: <SaveIcon />, name: 'Save' },
    { icon: <PrintIcon />, name: 'Print' },
    { icon: <ShareIcon />, name: 'Share' },
  ];

  return (
    <div>
      <CssBaseline />
      <Stage
        // scale={{x: 1.2, y: 1.2}}
        width={surfaceWidth}
        height={surfaceHeight}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
      >
        <Layer>
          {/*{EntityStorage.findByComponentName(entityStorage, 'GameMapComponent')?.map((entity) => {*/}
          {/*  console.log("entity", entity)*/}
          {/*  const { componentsByName } = entity;*/}
          {/*  return (*/}
          {/*    <CustomImage*/}
          {/*      key={entity.id}*/}
          {/*      url={componentsByName['ImageComponent'].url}*/}
          {/*      isSelected={entity.id === selectedId}*/}
          {/*      onSelect={() => {*/}
          {/*        selectShape(entity.id);*/}
          {/*      }}*/}
          {/*      */}
          {/*      // width={componentsByName['SizeComponent'].width}*/}
          {/*      // height={componentsByName['SizeComponent'].height}*/}
          {/*      // x={componentsByName['PositionComponent'].x}*/}
          {/*      // y={componentsByName['PositionComponent'].y}*/}
          {/*      */}
          {/*      // onDragStart={() => {*/}
          {/*      //   setState({*/}
          {/*      //     isDragging: true*/}
          {/*      //   });*/}
          {/*      // }}*/}
          {/*      */}
          {/*      // draggable={!componentsByName['PositionComponent'].locked}*/}
          {/*      */}
          {/*      // onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {*/}
          {/*      //   setEntityStorage(*/}
          {/*      //     EntityStorage.addEntity(*/}
          {/*      //       entityStorage,*/}
          {/*      //       Entity.addComponent(entity, {*/}
          {/*      //         ...componentsByName['PositionComponent'],*/}
          {/*      //         x: e.target.x(),*/}
          {/*      //         y: e.target.y()*/}
          {/*      //       })*/}
          {/*      //     )*/}
          {/*      //   );*/}
          {/*      // }}*/}
          {/*    />*/}
          {/*  );*/}
          {/*})}*/}
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

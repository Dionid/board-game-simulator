import React, { Fragment } from 'react';
import { Layer, Stage, Transformer, Image } from 'react-konva';
import CssBaseline from '@mui/material/CssBaseline';
import Konva from 'konva';
import { useImage } from '../../libs/react/hooks/use-image';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';

const CustomImage = (
  props: { url: string; isSelected: boolean; onSelect: () => void } & Omit<Konva.ImageConfig, 'image'>
) => {
  const { url, isSelected, onSelect } = props;

  const [image] = useImage(url);

  const shapeRef = React.useRef<Konva.Image | null>(null);
  const trRef = React.useRef<Konva.Transformer | null>(null);

  React.useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      if (shapeRef.current) {
        trRef.current?.nodes([shapeRef.current]);
        trRef.current?.getLayer()?.batchDraw();
      }
    }
  }, [isSelected]);

  return (
    <Fragment>
      <Image
        {...props}
        ref={shapeRef}
        onClick={onSelect}
        onTap={onSelect}
        draggable
        // x={state.x}
        // y={state.y}
        // fill={state.isDragging ? 'green' : 'black'}
        // onDragStart={() => {
        //   setState({
        //     isDragging: true
        //   });
        // }}
        // onDragEnd={e => {
        //   setState({
        //     isDragging: false,
        //     x: e.target.x(),
        //     y: e.target.y()
        //   });
        // }}
        image={image}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 100 || newBox.height < 100) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </Fragment>
  );
};

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

  const actions = [
    { icon: <FileCopyIcon />, name: 'Copy' },
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
          <CustomImage
            url={
              'https://downloader.disk.yandex.ru/preview/dfe66cd35d8feabf8ce64c40339d342e3f91b6c2e70db5c0046745aee0fc7b0a/623f62e7/HTA3saKP7S9n3UVUFPbneRLOs38Aexzy74peiw68-Bqu1Ghp-2pZ66iNDKp7lyv_THLyuC5YhZtrQDywSWC10Q%3D%3D?uid=0&filename=Screenshot%202022-03-26%20at%2018.00.35.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=0&tknv=v2&size=2878x1478'
            }
            isSelected={'map' === selectedId}
            onSelect={() => {
              selectShape('map');
            }}
            width={700}
            height={450}
          />
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
          <SpeedDialAction key={action.name} icon={action.icon} tooltipTitle={action.name} />
        ))}
      </SpeedDial>
    </div>
  );
}

export default App;

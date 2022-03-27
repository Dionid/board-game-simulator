import React, { useReducer } from 'react';
import { Layer, Stage } from 'react-konva';
import CssBaseline from '@mui/material/CssBaseline';
import Konva from 'konva';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import { CustomImage } from '../../modules/widgets/CustomImage/ui';
import { rootReducer } from '../../libs/bgs/redux';
import { gameMapEntityAdapter, gameMapEntitySlice } from '../../libs/bgs/redux/game-map-entity';
import { Component, ComponentId, Entity, EntityId } from '../../libs/bgs/core/esc';
import { UUID } from '../../libs/branded-types';
import { fighterEntityAdapter, fighterEntitySlice } from '../../libs/bgs/redux/fighter-entity';
import { FighterEntity } from '../../libs/bgs/core/entities/figter';

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

  const [entityStore, dispatch] = useReducer(rootReducer, {
    gameMapEntity: gameMapEntityAdapter.getInitialState(),
    fighterEntity: fighterEntityAdapter.getInitialState(),
  });

  const actions = [
    {
      icon: <FileCopyIcon />,
      name: 'Add map',
      onClick: async () => {
        console.log('ON CLICK');
        dispatch(
          gameMapEntitySlice.actions.addOne({
            id: EntityId.new(),
            name: 'GameMapEntity',
            components: {
              GameMapComponent: {
                name: 'GameMapComponent',
                id: ComponentId.new(),
                data: {
                  serverId: UUID.new(),
                  mapName: 'Some map',
                },
              },
              PositionComponent: {
                name: 'PositionComponent',
                id: ComponentId.new(),
                data: {
                  x: 100,
                  y: 100,
                  z: 0,
                },
              },
              ImageComponent: {
                name: 'ImageComponent',
                id: ComponentId.new(),
                data: {
                  url: 'https://downloader.disk.yandex.ru/preview/dfe66cd35d8feabf8ce64c40339d342e3f91b6c2e70db5c0046745aee0fc7b0a/623f62e7/HTA3saKP7S9n3UVUFPbneRLOs38Aexzy74peiw68-Bqu1Ghp-2pZ66iNDKp7lyv_THLyuC5YhZtrQDywSWC10Q%3D%3D?uid=0&filename=Screenshot%202022-03-26%20at%2018.00.35.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=0&tknv=v2&size=2878x1478',
                },
              },
              SizeComponent: {
                name: 'SizeComponent',
                id: ComponentId.new(),
                data: {
                  width: 750,
                  height: 500,
                },
              },
              DraggableComponent: {
                name: 'DraggableComponent',
                id: ComponentId.new(),
                data: {
                  draggable: true,
                  isDragging: false,
                },
              },
            },
          })
        );
      },
    },
    {
      icon: <SaveIcon />,
      name: 'Save',
      onClick: async () => {
        console.log('ON CLICK');
        dispatch(
          fighterEntitySlice.actions.addOne(
            FighterEntity.new(
              'https://downloader.disk.yandex.ru/preview/161897aa02b8194c76d656eef6457102eb834eaf8f5ae87bd6a187bb82cdb4fd/623f6aaa/UD-u8vK1z1fLXA14AVIV7W9G13sooEQOAswJRV651SmGSoZFp5wTl-y7PHaF0ne9Z3yDPVHa8Xri9lPONPSPaA%3D%3D?uid=0&filename=Screenshot%202022-03-26%20at%2018.33.34.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=0&tknv=v2&size=2048x2048'
            )
          )
        );
      },
    },
    { icon: <PrintIcon />, name: 'Print' },
    { icon: <ShareIcon />, name: 'Share' },
  ];

  return (
    <div>
      <CssBaseline />
      <Stage width={surfaceWidth} height={surfaceHeight} onMouseDown={checkDeselect} onTouchStart={checkDeselect}>
        <Layer>
          {gameMapEntityAdapter
            .getSelectors()
            .selectAll(entityStore.gameMapEntity)
            .map((entity) => {
              return (
                <CustomImage
                  key={entity.id}
                  url={entity.components.ImageComponent.data.url}
                  isSelected={entity.id === selectedId}
                  onSelect={() => {
                    selectShape(entity.id);
                  }}
                  width={entity.components.SizeComponent.data.width}
                  height={entity.components.SizeComponent.data.height}
                  draggable={entity.components.DraggableComponent.data.draggable}
                  x={entity.components.PositionComponent.data.x}
                  y={entity.components.PositionComponent.data.y}
                  onDragMove={(evt) => {
                    dispatch(
                      gameMapEntitySlice.actions.updateOne({
                        id: entity.id,
                        changes: Entity.updateComponent(
                          entity,
                          Component.update(entity.components.PositionComponent, {
                            x: evt.target.x(),
                            y: evt.target.y(),
                          })
                        ),
                      })
                    );
                  }}
                  onDragStart={() => {
                    dispatch(
                      gameMapEntitySlice.actions.updateOne({
                        id: entity.id,
                        changes: Entity.updateComponent(
                          entity,
                          Component.update(entity.components.DraggableComponent, {
                            isDragging: true,
                          })
                        ),
                      })
                    );
                  }}
                  onDragEnd={(evt) => {
                    dispatch(
                      gameMapEntitySlice.actions.updateOne({
                        id: entity.id,
                        changes: Entity.updateComponents(entity, {
                          DraggableComponent: Component.update(entity.components.DraggableComponent, {
                            isDragging: false,
                          }),
                          PositionComponent: Component.update(entity.components.PositionComponent, {
                            x: evt.target.x(),
                            y: evt.target.y(),
                          }),
                        }),
                      })
                    );
                  }}
                />
              );
            })}
        </Layer>
        <Layer>
          {fighterEntityAdapter
            .getSelectors()
            .selectAll(entityStore.fighterEntity)
            .map((entity) => {
              return (
                <CustomImage
                  key={entity.id}
                  url={entity.components.ImageComponent.data.url}
                  isSelected={entity.id === selectedId}
                  onSelect={() => {
                    selectShape(entity.id);
                  }}
                  width={entity.components.SizeComponent.data.width}
                  height={entity.components.SizeComponent.data.height}
                  draggable={entity.components.DraggableComponent.data.draggable}
                  x={entity.components.PositionComponent.data.x}
                  y={entity.components.PositionComponent.data.y}
                  onDragMove={(evt) => {
                    dispatch(
                      fighterEntitySlice.actions.updateOne({
                        id: entity.id,
                        changes: {
                          components: {
                            ...entity.components,
                            PositionComponent: {
                              ...entity.components.PositionComponent,
                              data: {
                                ...entity.components.PositionComponent.data,
                                x: evt.target.x(),
                                y: evt.target.y(),
                              },
                            },
                          },
                        },
                      })
                    );
                  }}
                  onDragStart={() => {
                    dispatch(
                      fighterEntitySlice.actions.updateOne({
                        id: entity.id,
                        changes: {
                          components: {
                            ...entity.components,
                            DraggableComponent: {
                              ...entity.components.DraggableComponent,
                              data: {
                                ...entity.components.DraggableComponent.data,
                                isDragging: true,
                              },
                            },
                          },
                        },
                      })
                    );
                  }}
                  onDragEnd={(evt) => {
                    dispatch(
                      fighterEntitySlice.actions.updateOne({
                        id: entity.id,
                        changes: {
                          components: {
                            ...entity.components,
                            DraggableComponent: {
                              ...entity.components.DraggableComponent,
                              data: {
                                ...entity.components.DraggableComponent.data,
                                isDragging: false,
                              },
                            },
                            PositionComponent: {
                              ...entity.components.PositionComponent,
                              data: {
                                ...entity.components.PositionComponent.data,
                                x: evt.target.x(),
                                y: evt.target.y(),
                              },
                            },
                          },
                        },
                      })
                    );
                  }}
                />
              );
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

import { Texture, Assets, Container, TilingSprite } from 'pixi.js';
import exampleData from './example.json';

export type Tile = {
  id: number;
  properties: any[];
  tileSetPosition: {
    x: number;
    y: number;
  };
};

export type TileSet = {
  name: string;
  texture: Texture;
  imageHeight: number;
  imageWidth: number;
  spriteWidth: number;
  spriteHeight: number;
  tilesCount: number;
  columns: number;
  rows: number;
  tile: {
    [key: string]: Tile;
  };
};

export type TileLayer = {
  name: string;
  data: number[];
  width: number;
  height: number;
  type: 'tilelayer';
  visible: boolean;
  x: number;
  y: number;
  opacity: number;
};

export type TileMap<D> = {
  data: D;
  columns: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
  spriteHeight: number;
  tileSet: {
    [key: string]: TileSet;
  };
  layers: {
    [key: string]: TileLayer;
  };
  activeTileSet: string;
};

export type Map<MD extends typeof exampleData> = {
  container: Container;
  tileMap: TileMap<MD>;
};

export const initTileMap = async <MD extends typeof exampleData>(props: {
  assetName: string;
  texture: Texture | string;
  mapData: MD;
}): Promise<Map<MD>> => {
  const mapContainer = new Container();

  let tileSetTexture: Texture;

  if (typeof props.texture === 'string') {
    tileSetTexture = (await Assets.load(props.texture)) as Texture;
  } else {
    tileSetTexture = props.texture;
  }

  const mapData = props.mapData;

  const tileMap: TileMap<typeof mapData> = {
    data: mapData,
    columns: mapData.width,
    rows: mapData.height,
    tileWidth: mapData.tilewidth,
    tileHeight: mapData.tileheight,
    spriteHeight: mapData.tilewidth * 2,
    tileSet: {},
    layers: {},
    activeTileSet: props.assetName,
  };

  for (const tileSetData of tileMap.data.tilesets) {
    const tileSet: TileSet = {
      name: tileSetData.name,
      texture: tileSetTexture,
      imageHeight: tileSetData.imageheight,
      imageWidth: tileSetData.imagewidth,
      spriteWidth: tileSetData.tilewidth,
      spriteHeight: tileSetData.tileheight,
      tilesCount: tileSetData.tilecount,
      columns: tileSetData.columns,
      rows: tileSetData.imageheight / tileSetData.tileheight,
      tile: {},
    };

    for (const tileData of tileSetData.tiles) {
      tileSet.tile[tileData.id] = {
        id: tileData.id,
        properties: tileData.properties,
        tileSetPosition: {
          x: (tileData.id % tileSet.columns) * tileSet.spriteWidth,
          y: Math.floor(tileData.id / tileSet.columns) * tileSet.spriteHeight,
        },
      };
    }

    tileMap.tileSet[tileSetData.name] = tileSet;
  }

  for (const layerData of tileMap.data.layers) {
    if (layerData.type !== 'tilelayer') {
      continue;
    }

    const tileLayer: TileLayer = {
      name: layerData.name,
      data: layerData.data || [],
      width: layerData.width || 0,
      height: layerData.height || 0,
      type: layerData.type,
      visible: layerData.visible,
      x: layerData.x,
      y: layerData.y,
      opacity: layerData.opacity,
    };

    tileMap.layers[layerData.name] = tileLayer;
  }

  for (let y = 0; y < tileMap.rows; y++) {
    for (let x = 0; x < tileMap.columns; x++) {
      for (const layerName in tileMap.layers) {
        const layer = tileMap.layers[layerName];

        const layerTileId = layer.data[y * tileMap.columns + x];

        if (layerTileId === 0) {
          continue;
        }

        const tileSet = tileMap.tileSet[tileMap.activeTileSet];

        const tileId = layerTileId - 1;

        const tileData = tileSet.tile[tileId];

        if (!tileData) {
          throw new Error(`Tile with id ${tileId} not found`);
        }

        const tileWidth = tileMap.tileWidth; // 256
        const tileHeight = tileMap.tileHeight; // 128
        const spriteHeight = tileMap.spriteHeight; // 512

        const tile = new TilingSprite({
          label: `${layerName.toLocaleLowerCase().replaceAll(' ', '_')}-tile-${y}-${x}`,
          texture: tileSet.texture,
          width: tileSet.spriteWidth,
          height: tileSet.spriteHeight,
          tilePosition: {
            x: -tileData.tileSetPosition.x,
            y: -tileData.tileSetPosition.y,
          },
          x: (x * tileWidth) / 2 - (y * tileWidth) / 2,
          // y: (x * tileHeight) / 2 + (y * tileHeight) / 2,
          y: (x * tileHeight) / 2 + (y * tileHeight) / 2 - (spriteHeight - tileHeight),
          anchor: {
            x: 0,
            y: 0,
          },
          cullable: true,
          visible: layer.visible,
        });

        // tile.zIndex = positionY + positionX;
        // tile.zIndex = positionY;
        // tile.zIndex = ((positionY + positionX) * tileSet.tileWidth) / 4;

        // const depthModifier =
        //   props.layerTileDepthModifier[layerName as MD['layers'][number]['name']] ??
        //   props.layerTileDepthModifier.default ??
        //   0;

        // tile.zIndex = isoPosition.y + depthModifier;
        // tile.zIndex = positionY + depthModifier;

        // tile.zIndex = isoPosition.x + isoPosition.y;

        // layer.container.addChild(tile);

        mapContainer.addChild(tile);
      }
    }
  }

  mapContainer.position.set(0, 0);
  mapContainer.pivot.set(0, 0);

  return {
    container: mapContainer,
    tileMap,
  };
};

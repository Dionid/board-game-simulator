import { Texture, Assets, Container, TilingSprite } from 'pixi.js';
import mapData from '../assets/FirstMap.json';
import { Vector2 } from '.';

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
  tileWidth: number;
  tileHeight: number;
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
  tileSet: {
    [key: string]: TileSet;
  };
  layers: {
    [key: string]: TileLayer;
  };
  activeTileSet: string;
};

export function cartisianToIso(vector: Vector2): Vector2 {
  return {
    x: vector.x - vector.y,
    y: (vector.x + vector.y) / 2,
  };
}

export function isoToCartisian(vector: Vector2): Vector2 {
  return {
    x: (2 * vector.y + vector.x) / 2,
    y: (2 * vector.y - vector.x) / 2,
  };
}

export const initTileMap = async () => {
  const kennyTileSet = (await Assets.load('assets/kennytilesheet.png')) as Texture;
  const tileMap: TileMap<typeof mapData> = {
    data: mapData,
    columns: mapData.width,
    rows: mapData.height,
    tileSet: {},
    layers: {},
    activeTileSet: 'kennytilesheet',
  };

  for (const tileSetData of tileMap.data.tilesets) {
    const tileSet: TileSet = {
      name: tileSetData.name,
      texture: kennyTileSet,
      imageHeight: tileSetData.imageheight,
      imageWidth: tileSetData.imagewidth,
      tileWidth: tileSetData.tilewidth,
      tileHeight: tileSetData.tileheight,
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
          x: (tileData.id % tileSet.columns) * tileSet.tileWidth,
          y: Math.floor(tileData.id / tileSet.columns) * tileSet.tileHeight,
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

  console.log(tileMap);

  const mapContainer = new Container();

  const floorLayer = tileMap.layers['Floor'];

  if (!floorLayer) {
    throw new Error('Floor layer not found');
  }

  console.log(floorLayer.data);

  for (let r = 0; r < tileMap.rows; r++) {
    for (let c = 0; c < tileMap.columns; c++) {
      const layerTileId = floorLayer.data[r * tileMap.columns + c];

      if (layerTileId === 0) {
        continue;
      }

      const tileId = layerTileId - 1;

      const tileData = tileMap.tileSet[tileMap.activeTileSet].tile[tileId];

      if (!tileData) {
        throw new Error(`Tile with id ${tileId} not found`);
      }

      const positionX = (c * tileMap.tileSet[tileMap.activeTileSet].tileWidth) / 2;
      const positionY = (r * tileMap.tileSet[tileMap.activeTileSet].tileHeight) / 4;

      const isoPosition = cartisianToIso({ x: positionX, y: positionY });

      const tile = new TilingSprite({
        texture: tileMap.tileSet[tileMap.activeTileSet].texture,
        width: tileMap.tileSet[tileMap.activeTileSet].tileWidth,
        height: tileMap.tileSet[tileMap.activeTileSet].tileHeight,
        tilePosition: {
          x: -tileData.tileSetPosition.x,
          y: -tileData.tileSetPosition.y,
        },
        x: isoPosition.x,
        y: isoPosition.y,
        pivot: {
          x: 0,
          y: 0,
        },
        anchor: {
          x: 0.5,
          y: 0,
        },
      });

      mapContainer.addChild(tile);
    }
  }

  mapContainer.scale.set(0.5);
  mapContainer.position.set(0, 0);
  mapContainer.pivot.set(0, 0);

  return mapContainer;
};

import { activateDebugMode } from 'libs/tengine/debug';
import { newGame, initGame } from 'libs/tengine/game';
import mapData from './SMC.json';
import { Assets, Container, Texture, TilingSprite } from 'pixi.js';

export async function initSuperMarioLikeGame(parentElement: HTMLElement) {
  const game = newGame({
    canvas: {
      parentElement,
      resizeTo: window,
    },
  });

  activateDebugMode(game, {
    render: {
      view: false,
      xy: false,
      collision: false,
      velocity: false,
      acceleration: false,
    },
  });

  await initGame(game, {
    backgroundColor: 0x000000,
  });

  const mapContainer = new Container();

  const tilesetTexture = (await Assets.load('assets/world-tiles.png')) as Texture;

  const tileMap = {
    data: mapData,
    columns: mapData.height,
    rows: mapData.width,
    tileWidth: mapData.tilewidth,
    tileHeight: mapData.tileheight,
  };

  const tilesetColumns = 18;

  console.log('tileMap', tileMap);

  for (const layer of mapData.layers) {
    if (!layer.data) {
      continue;
    }

    const layerName = layer.name;

    for (let col = 0; col < tileMap.columns; col++) {
      for (let row = 0; row < tileMap.rows; row++) {
        const ind = col * tileMap.rows + row;
        const tileData = layer.data[ind];

        if (tileData === 0) {
          continue;
        }

        const tile = new TilingSprite({
          label: `${layerName.toLocaleLowerCase().replaceAll(' ', '_')}-tile-${col}-${row}`,
          texture: tilesetTexture,
          width: tileMap.tileWidth,
          height: tileMap.tileHeight,
          tilePosition: {
            x: -1 * (tileData % tilesetColumns) * tileMap.tileWidth + tileMap.tileWidth,
            y: -1 * Math.floor(tileData / tilesetColumns) * tileMap.tileHeight,
          },
          x: row * tileMap.tileWidth,
          y: col * tileMap.tileHeight,
          anchor: {
            x: 0,
            y: 0,
          },
          cullable: true,
          visible: layer.visible,
        });

        mapContainer.addChild(tile);
      }
    }
  }

  mapContainer.scale.set(1.5);

  mapContainer.x = 50;
  mapContainer.y = 50;

  game.world.container.addChild(mapContainer);

  return game;
}

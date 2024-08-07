import { spawnEntity, setComponent } from 'libs/tecs';
import {
  verticesColliderComponent,
  rectangleColliderComponent,
  ColliderBody,
} from 'libs/tengine/collision';
import { Position2 } from 'libs/tengine/core';
import { Game } from 'libs/tengine/game';
import { Container, Assets, Texture, TilingSprite } from 'pixi.js';
import { DeathZone } from './logic';
import mapData from './SMC.json';
import { RigidBody, Static } from 'libs/tengine/physics';
import { Ground } from 'libs/tengine/controls';

export const initMap = async (game: Game) => {
  const map = {
    container: new Container(),
  };

  const tilesetTexture = (await Assets.load('assets/world-tiles.png')) as Texture;

  const tileMap = {
    data: mapData,
    columns: mapData.height,
    rows: mapData.width,
    tileWidth: mapData.tilewidth,
    tileHeight: mapData.tileheight,
  };

  const tilesetColumns = 18;

  const renderLayers: {
    data: typeof mapData.layers[number];
    tiles: TilingSprite[];
  }[] = [];

  // # Render map
  for (const layer of mapData.layers) {
    if (layer.type !== 'tilelayer') {
      continue;
    }

    if (!layer.data) {
      continue;
    }

    const tiles: TilingSprite[] = [];

    renderLayers.push({
      tiles,
      data: layer,
    });

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

        tiles.push(tile);

        map.container.addChild(tile);
      }
    }
  }

  // # Add colliders
  for (const layer of mapData.layers) {
    if (layer.type !== 'objectgroup') {
      continue;
    }

    if (!layer.objects) {
      continue;
    }

    // # Add colliders
    for (const object of layer.objects) {
      const colliderEntity = spawnEntity(game.essence);

      const position = {
        x: object.x,
        y: object.y,
      };
      setComponent(game.essence, colliderEntity, Position2, {
        x: position.x,
        y: position.y,
        _prev: { x: position.x, y: position.y },
      });

      const isSolid = object.properties.some((p) => {
        return p.name === 'isSolid' && p.value === true;
      });
      const type = isSolid ? 'solid' : 'sensor';

      const parts = [];

      if ('polygon' in object) {
        parts.push(
          verticesColliderComponent({
            parentPosition: position,
            vertices: object.polygon as any,
            anchor: { x: 0, y: 0 },
            type,
            mass: 0,
          })
        );
      } else {
        parts.push(
          rectangleColliderComponent({
            parentPosition: position,
            size: {
              width: object.width,
              height: object.height,
            },
            type,
            mass: 0,
            anchor: { x: 0, y: 0 },
          })
        );
      }

      setComponent(game.essence, colliderEntity, ColliderBody, {
        parts,
      });
      setComponent(game.essence, colliderEntity, RigidBody);
      setComponent(game.essence, colliderEntity, Static);

      // # Death zones
      if (
        object.properties.some((p) => {
          return p.name === 'isDeath' && p.value === true;
        })
      ) {
        setComponent(game.essence, colliderEntity, DeathZone);
      }

      // # Ground
      if (
        object.properties.some((p) => {
          return p.name === 'isGround' && p.value === true;
        })
      ) {
        setComponent(game.essence, colliderEntity, Ground);
      }
    }
  }

  return map;
};

import {
  $defaultFn,
  $kind,
  newSchema,
  newWorld,
  number,
  string,
  System,
  table,
  registerSystem,
  spawnEntity,
  setComponent,
  World,
  registerQuery,
  Topic,
  newTopic,
  registerTopic,
  newTag,
  Entity,
} from '../../../libs/tecs';
import { hasSchema, tryTable } from '../../../libs/tecs/archetype';
import { Query } from '../../../libs/tecs/query';
import Phaser from 'phaser';
import { generateMultipleFramesAnimation, generateOneFrameAnimation } from './animation';
import PhaserNavMeshPlugin, { PhaserNavMesh } from '../../../libs/phaser-navmesh';
import EasyStar from 'easystarjs';

// # Schemas

export const View = newTag();

// export const $graphics = Symbol('graphics');

// export const graphics = {
//   [$kind]: $graphics,
//   byteLength: 8,
//   [$defaultFn]: () => new Graphics(),
// } as const;

// export const pGraphics = newSchema({
//   value: graphics,
// });

export const Position = newSchema({
  x: number,
  y: number,
});

export const Size = newSchema({
  width: number,
  height: number,
});

export const Color = newSchema({
  value: string,
});

// # Topics
const clicked = newTopic<{ type: 'clicked'; position: { x: number; y: number } }>();
const viewEvents = newTopic<{ type: 'pointerOver'; entity: Entity }>();

// # Systems

export const ViewEvents = (): System => {
  return ({ world, deltaFrameTime }) => {
    for (const event of viewEvents) {
      setComponent(world, event.entity, Color, { value: 'blue' });
    }
  };
};

export const initWorld = () => {
  const world = newWorld();

  // # Topics
  registerTopic(world, clicked);
  registerTopic(world, viewEvents);

  window.addEventListener('click', (e) => {
    Topic.emit(clicked, { type: 'clicked', position: { x: e.clientX, y: e.clientY } });
  });

  // # Systems
  // registerSystem(world, Draw(world, app));
  // registerSystem(world, Clicked(app));
  // registerSystem(world, ViewEvents(app));

  const entity = spawnEntity(world);
  // const circle = new Graphics().circle(0, 0, 50);
  // setComponent(world, entity, View);
  // setComponent(world, entity, pGraphics, { value: circle });
  // setComponent(world, entity, Position, { x: 100, y: 100 });
  // setComponent(world, entity, Size, { width: 100, height: 100 });
  // setComponent(world, entity, Color, { value: 'red' });

  return world;
};

function twoDToIso(x: number, y: number) {
  const twoDX = x - y;
  const twoDY = (x + y) / 2;
  return { x: twoDX, y: twoDY };
}

function isoToTwoD(x: number, y: number) {
  const isoX = (2 * y + x) / 2;
  const isoY = (2 * y - x) / 2;
  return { x: isoX, y: isoY };
}

export class MainScene extends Phaser.Scene {
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  player!: Phaser.Physics.Matter.Sprite;
  targetX: number;
  targetY: number;
  playerSpeed: number;
  movementTrajectoryL!: Phaser.GameObjects.Line;
  cameraMovementDirection: { x: number; y: number };
  cameraMoveThreshold: number;
  cameraMovementSpeed: number;
  tileWidth: number;
  tileHeight: number;

  constructor() {
    super('MainScene');
    this.targetX = 0;
    this.targetY = 0;
    this.playerSpeed = 10;
    this.cameraMovementDirection = { x: 0, y: 0 };
    this.cameraMoveThreshold = 200;
    this.cameraMovementSpeed = 30;
    this.tileWidth = 256;
    this.tileHeight = 512;
  }

  preload() {
    this.load.image('base_tiles', 'assets/kennytilesheet.png');
    this.load.tilemapTiledJSON('tilemap', 'assets/FirstMap.json');

    this.load.atlas('human', 'assets/human_atlas.png', 'assets/human_atlas.json');

    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  pathfinder!: EasyStar.js;
  floorLayer!: Phaser.Tilemaps.TilemapLayer;

  create() {
    const map = this.make.tilemap({ key: 'tilemap' });
    const tileset = map.addTilesetImage('kennytilesheet', 'base_tiles');

    if (!tileset) {
      throw new Error('Tileset not found');
    }

    this.floorLayer = map.createLayer('Floor', tileset, 0, 0)!;
    const innerWalls = map.createLayer('Inner Walls', tileset, 0, 0);
    const outerWalls = map.createLayer('Outer Walls', tileset, 0, 0);
    const obstacles = map.createLayer('Obstacles', tileset, 0, 0);

    if (!innerWalls || !outerWalls || !obstacles) {
      throw new Error('Layer not found');
    }

    innerWalls.setCollisionByProperty({ collides: true });
    outerWalls.setCollisionByProperty({ collides: true });
    obstacles.setCollisionByProperty({ collides: true });

    outerWalls.setVisible(false);

    this.matter.world.convertTilemapLayer(innerWalls);
    this.matter.world.convertTilemapLayer(outerWalls);
    this.matter.world.convertTilemapLayer(obstacles);

    const startingTile = this.floorLayer.getTileAt(0, 0);
    console.log('startingTile.width', startingTile.x, startingTile.y);

    // # Player
    this.player = this.matter.add.sprite(startingTile.x, startingTile.y, 'human', 'Human_0_Idle0.png', {
      shape: {
        type: 'circle',
        radius: 30,
      },
    });

    this.player.setOrigin(0.5, 0.88);
    this.player.setFixedRotation();
    this.player.setPosition(startingTile.x, startingTile.y);

    generateOneFrameAnimation(this, 'human-idle', 'Idle');
    generateMultipleFramesAnimation(this, 'human-run', 'Run', 9);
    this.player.anims.play('human-idle-b');

    this.cameras.main.centerOn(this.player.x, this.player.y);

    this.pathfinder = new EasyStar.js();

    const grid = [];

    for (let y = 0; y < map.height; y++) {
      const col = [];
      for (let x = 0; x < map.width; x++) {
        const innerWallsTile = innerWalls.getTileAt(x, y);

        // # If inner wall exists and is bigger than 0
        if (innerWallsTile) {
          col.push(1);
          continue;
        }

        const outerWallsTile = outerWalls.getTileAt(x, y);

        if (outerWallsTile) {
          col.push(1);
          continue;
        }

        const obstaclesTile = obstacles.getTileAt(x, y);

        if (obstaclesTile) {
          col.push(1);
          continue;
        }

        col.push(0);
      }
      grid.push(col);
    }

    console.log('grid', grid);
    this.pathfinder.setGrid(grid);
    this.pathfinder.setAcceptableTiles([0]);
    this.pathfinder.enableDiagonals();

    try {
      const tile = this.floorLayer.getIsoTileAtWorldXY(this.player.x, this.player.y);

      // console.log('fromX', fromX, 'fromY', fromY);
      // this.pathfinder.findPath(fromX, fromY, fromX + 2, fromY + 2, (path) => {
      //   if (path) {
      //     console.log('Path found', path);
      //   } else {
      //     console.log('Path not found');
      //   }
      // });
    } catch (e) {
      console.error(e);
    }

    this.pathfinder.calculate();

    // # Collision
    // # Reset target on collision with walls
    this.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
      if (event.pairs.length > 0) {
        const pair = event.pairs[0];
        if (pair.bodyA === this.player.body || pair.bodyB === this.player.body) {
          this.targetX = this.player.x;
          this.targetY = this.player.y;
        }
      }
    });

    this.input.on(
      'pointerdown',
      (pointer: any) => {
        this.targetX = pointer.worldX;
        this.targetY = pointer.worldY;

        console.log('pointer', pointer.worldX, pointer.worldY);

        const tile = this.floorLayer.getIsoTileAtWorldXY(pointer.worldX, pointer.worldY);
        console.log('mtile', tile);

        // const startingTile = this.floorLayer.getTileAt(0, 0);
        // console.log('startingTile.width', startingTile.x, startingTile.y);
      },
      this
    );

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const { x, y } = pointer;

      if (x > this.scale.width - this.cameraMoveThreshold) {
        this.cameraMovementDirection.x = 1 - (this.scale.width - x) / this.cameraMoveThreshold;
      } else if (x < this.cameraMoveThreshold) {
        this.cameraMovementDirection.x = -1 + x / this.cameraMoveThreshold;
      } else {
        this.cameraMovementDirection.x = 0;
      }

      if (y > this.scale.height - this.cameraMoveThreshold) {
        this.cameraMovementDirection.y = 1 - (this.scale.height - y) / this.cameraMoveThreshold;
      } else if (y < this.cameraMoveThreshold) {
        this.cameraMovementDirection.y = -1 + y / this.cameraMoveThreshold;
      } else {
        this.cameraMovementDirection.y = 0;
      }
    });

    // # Move trajectory
    this.movementTrajectoryL = this.add.line(0, 0, 0, 0, 0, 0, 0xff0fff, 1);
    this.targetGraphics = this.add.circle(this.targetX, this.targetY, 10, 0xff0fff, 0);
  }

  targetGraphics!: Phaser.GameObjects.Arc;

  update(t: number, dt: number) {
    if (!this.cursors || !this.player) {
      return;
    }

    // # Camera movement
    const cam = this.cameras.main;

    if (this.cursors.left.isDown) {
      cam.scrollX -= this.cameraMovementSpeed / 2;
    } else if (this.cursors.right.isDown) {
      cam.scrollX += this.cameraMovementSpeed / 2;
    } else if (this.cursors.up.isDown) {
      cam.scrollY -= this.cameraMovementSpeed / 2;
    } else if (this.cursors.down.isDown) {
      cam.scrollY += this.cameraMovementSpeed / 2;
    } else {
      cam.scrollX += this.cameraMovementDirection.x * this.cameraMovementSpeed;
      cam.scrollY += this.cameraMovementDirection.y * this.cameraMovementSpeed;
    }

    // this.navMesh.debugDrawClear();

    // # Movement
    if (this.targetX && this.targetY) {
      this.targetGraphics.x = this.targetX;
      this.targetGraphics.y = this.targetY;

      // const path = this.navMesh.findPath({ x: this.player.x, y: this.player.y }, { x: this.targetX, y: this.targetY });
      // if (path) {
      //   this.navMesh.debugDrawPath(path, 0xff0fff);
      // }

      this.movementTrajectoryL.setTo(this.player.x, this.player.y, this.targetX, this.targetY);
      this.movementTrajectoryL.setFillStyle(0xff0fff, 1);

      // this.graphics.lineBetween(this.player.x, this.player.y, this.targetX, this.targetY);
      // Check if the player is close to the target position
      var distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.targetX, this.targetY);
      if (distance < 10) {
        this.targetGraphics.alpha = 0;
        this.targetX = 0;
        this.targetY = 0;

        const parts = this.player.anims.currentAnim?.key.split('-');
        parts![1] = 'idle';
        this.player.setVelocity(0, 0);
        this.player.anims.play(parts!.join('-'), true);
      } else {
        this.targetGraphics.alpha = 1;
        const dx = this.targetX - this.player.x;
        const dy = this.targetY - this.player.y;
        // const distance = Math.sqrt(dx * dx + dy * dy);

        // # By angle
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.targetX, this.targetY);

        if (angle > -Math.PI / 8 && angle < Math.PI / 8) {
          this.player.anims.play('human-run-r', true);
        } else if (angle > Math.PI / 8 && angle < (3 * Math.PI) / 8) {
          this.player.anims.play('human-run-br', true);
        } else if (angle > (3 * Math.PI) / 8 && angle < (5 * Math.PI) / 8) {
          this.player.anims.play('human-run-b', true);
        } else if (angle > (5 * Math.PI) / 8 && angle < (7 * Math.PI) / 8) {
          this.player.anims.play('human-run-bl', true);
        } else if (angle > (7 * Math.PI) / 8 || angle < (-7 * Math.PI) / 8) {
          this.player.anims.play('human-run-l', true);
        } else if (angle > (-7 * Math.PI) / 8 && angle < (-5 * Math.PI) / 8) {
          this.player.anims.play('human-run-tl', true);
        } else if (angle > (-5 * Math.PI) / 8 && angle < (-3 * Math.PI) / 8) {
          this.player.anims.play('human-run-t', true);
        } else {
          this.player.anims.play('human-run-tr', true);
        }

        this.player.setVelocityX((dx / distance) * this.playerSpeed);
        this.player.setVelocityY((dy / distance) * this.playerSpeed);
      }
    } else {
      const pointer = this.input.mousePointer;
      this.movementTrajectoryL.setTo(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
      this.movementTrajectoryL.setFillStyle(0xff0fff, 1);

      // this.movementTrajectoryGr.lineStyle(2, 0xff0fff, 1);
      // this.movementTrajectoryGr.lineBetween(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
    }
  }
}

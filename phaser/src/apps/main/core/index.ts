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
import { BodyType, Pair } from 'matter';

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

// # Queries

const drawQuery = Query.new(View, Position);

// # Systems

export const ViewEvents = (): System => {
  return ({ world, deltaFrameTime }) => {
    for (const event of viewEvents) {
      setComponent(world, event.entity, Color, { value: 'blue' });
    }
  };
};

// export const Clicked = (): System => {
//   return ({ world, deltaFrameTime }) => {
//     for (const event of clicked) {
//       const entity = spawnEntity(world);

//       const circle = new Graphics().circle(0, 0, 50).fill('red');
//       setComponent(world, entity, View);
//       setComponent(world, entity, pGraphics, { value: circle });
//       setComponent(world, entity, Position, { x: event.position.x, y: event.position.y });
//       setComponent(world, entity, Color, { value: 'red' });

//       circle.eventMode = 'static';
//       circle.on('pointerover', () => {
//         Topic.emit(viewEvents, { type: 'pointerOver', entity });
//       });
//     }
//   };
// };

// export const Draw = (world: World, ): System => {
//   const query = registerQuery(world, drawQuery);

//   return ({ world, deltaFrameTime }) => {
//     for (const archetype of query.archetypes) {
//       const positionT = table(archetype, Position);
//       const graphicsT = tryTable(archetype, pGraphics);
//       const colorT = tryTable(archetype, Color);

//       for (let i = 0, l = archetype.entities.length; i < l; i++) {
//         if (graphicsT) {
//           const graphics = graphicsT[i].value;

//           graphics.clear();
//           graphics.circle(positionT[i].x, positionT[i].y, 50);

//           if (colorT) {
//             graphics.fill(colorT[i].value);
//           }

//           if (graphics.parent === null) {
//             app.stage.addChild(graphics);
//           }
//         }
//       }
//     }

//     app.render();
//   };
// };

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

export class MainScene extends Phaser.Scene {
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  player!: Phaser.Physics.Matter.Sprite;
  targetX: number;
  targetY: number;
  playerSpeed: number;
  movementTrajectoryGr!: Phaser.GameObjects.Graphics;
  movementTrajectoryL!: Phaser.GameObjects.Line;
  cameraMovementDirection: { x: number; y: number };
  cameraMoveThreshold: number;
  cameraMovementSpeed: number;

  constructor() {
    super('MainScene');
    this.targetX = 0;
    this.targetY = 0;
    this.playerSpeed = 10;
    this.cameraMovementDirection = { x: 0, y: 0 };
    this.cameraMoveThreshold = 200;
    this.cameraMovementSpeed = 30;
  }

  preload() {
    // load the PNG file
    this.load.image('base_tiles', 'assets/kennytilesheet.png');

    // load the JSON file
    this.load.tilemapTiledJSON('tilemap', 'assets/FirstMap.json');

    this.load.atlas('human', 'assets/human_atlas.png', 'assets/human_atlas.json');

    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  create() {
    const map = this.make.tilemap({ key: 'tilemap' });

    const tileset = map.addTilesetImage('kennytilesheet', 'base_tiles');

    if (!tileset) {
      throw new Error('Tileset not found');
    }

    const halfWidth = map.widthInPixels / 2;
    const halfHeight = map.heightInPixels / 2;

    map.createLayer('Floor', tileset, halfWidth, 0);
    const innerWalls = map.createLayer('Inner Walls', tileset, halfWidth, 0);
    const outerWalls = map.createLayer('Outer Walls', tileset, halfWidth, 0);
    const obstacles = map.createLayer('Obstacles', tileset, halfWidth, 0);

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

    this.player = this.matter.add.sprite(halfWidth, halfHeight, 'human', 'Human_0_Idle0.png', {
      shape: {
        type: 'circle',
        radius: 30,
      },
    });

    this.player.setOrigin(0.5, 0.88);
    this.player.setFixedRotation();
    this.player.setPosition(halfWidth, halfHeight);

    generateOneFrameAnimation(this, 'human-idle', 'Idle');
    generateMultipleFramesAnimation(this, 'human-run', 'Run', 9);
    this.player.anims.play('human-idle-b');

    // # Reset target on collision with walls
    this.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
      if (event.pairs.length > 0) {
        const pair = event.pairs[0];
        if (pair.bodyA === this.player.body || pair.bodyB === this.player.body) {
          this.targetX = this.player.x;
          this.targetY = this.player.y;
        }
      }

      console.log('collision', event);
    });

    this.input.on(
      'pointerdown',
      (pointer: any) => {
        this.targetX = pointer.worldX;
        this.targetY = pointer.worldY;
      },
      this
    );

    this.cameras.main.centerOn(this.player.x, this.player.y);

    // 1 = 1 - (100 - 95) / 100

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
    this.movementTrajectoryL = this.add.line(0, 0, 0, 0, 0, 0, 0xff0000, 1);
    this.targetGraphics = this.add.circle(this.targetX, this.targetY, 10, 0xff0000, 0);
  }

  targetGraphics!: Phaser.GameObjects.Arc;

  update(t: number, dt: number) {
    if (!this.cursors || !this.player) {
      return;
    }

    // # Camera movement
    const cam = this.cameras.main;

    cam.scrollX += this.cameraMovementDirection.x * this.cameraMovementSpeed;
    cam.scrollY += this.cameraMovementDirection.y * this.cameraMovementSpeed;

    // # Movement
    if (this.targetX && this.targetY) {
      this.targetGraphics.x = this.targetX;
      this.targetGraphics.y = this.targetY;

      this.movementTrajectoryL.setTo(this.player.x, this.player.y, this.targetX, this.targetY);
      this.movementTrajectoryL.setFillStyle(0xff0000, 1);

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
      this.movementTrajectoryL.setFillStyle(0xff0000, 1);

      // this.movementTrajectoryGr.lineStyle(2, 0xff0000, 1);
      // this.movementTrajectoryGr.lineBetween(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
    }
  }
}

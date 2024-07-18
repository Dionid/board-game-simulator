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
  preload() {
    // load the PNG file
    this.load.image('base_tiles', 'assets/kennytilesheet.png');

    // load the JSON file
    this.load.tilemapTiledJSON('tilemap', 'assets/FirstMap.json');
  }

  create() {
    const map = this.make.tilemap({ key: 'tilemap' });

    const tileset = map.addTilesetImage('kennytilesheet', 'base_tiles');

    if (!tileset) {
      throw new Error('Tileset not found');
    }

    map.createLayer('Floor', tileset, map.widthInPixels / 2, 0);
    const innerWalls = map.createLayer('Inner Walls', tileset, map.widthInPixels / 2, 0);
    const outerWalls = map.createLayer('Outer Walls', tileset, map.widthInPixels / 2, 0);

    if (!innerWalls || !outerWalls) {
      throw new Error('Layer not found');
    }

    innerWalls.setCollisionByProperty({ collides: true });
    outerWalls.setCollisionByProperty({ collides: true });

    outerWalls.setVisible(false);

    // const debugGraph = this.add.graphics().setAlpha(0.75);
    // innerWalls.renderDebug(debugGraph, {
    //   tileColor: null,
    //   collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    // });
    // outerWalls.renderDebug(debugGraph, {
    //   tileColor: null,
    //   collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    // });

    this.matter.world.convertTilemapLayer(innerWalls);
    this.matter.world.convertTilemapLayer(outerWalls);
  }
}

// ---- ECS ----

/**
 * RESUME
 *
 * PROS
 * 1. Simple as hell
 *
 * CONS
 * 1. Components can be used only per one World (or we need to share them between worlds)
 */

type Entity = number;

export type Empty = {};

type System<Ctx> = (world: World<Ctx>) => void;

export type World<Ctx = unknown> = {
  entitiesArchetypes: number[];
  graveyard: Entity[];
  ctx: (world: World) => Ctx;
};

// # !!! You can leave components as they are and not reset them,
// because if new entity use them it will reset values (SoA Pros)

export const World = {
  new: <Ctx>(ctx: (world: World) => Ctx): World<Ctx> => {
    return {
      entitiesArchetypes: [],
      graveyard: [],
      ctx,
    };
  },
  createEntity: (world: World) => {
    if (world.graveyard.length > 0) {
      return world.graveyard.pop()!;
    }

    return world.entitiesArchetypes.push(0) - 1;
  },
  destroyEntity: (world: World, entity: Entity) => {
    world.entitiesArchetypes[entity] = 0;

    world.graveyard.push(entity);
  },
  step: (world: World, systems: System<any>[]) => {
    for (const system of systems) {
      system(world);
    }
  },
  addComponent: (world: World, entity: Entity, hasComponent: number) => {
    world.entitiesArchetypes[entity] |= hasComponent;
  },
  removeComponent: (world: World, entity: Entity, hasComponent: number) => {
    world.entitiesArchetypes[entity] &= ~hasComponent;
  },
  hasComponent: (world: World, entity: Entity, hasComponent: number) => {
    return (world.entitiesArchetypes[entity] & hasComponent) === hasComponent;
  },
};

// // ---- GAME ----

// enum Components {
//   Camera,
//   Player,
//   Position,
//   Velocity,
//   Finger,
//   Scale,
//   PanMode,
// }

// const Has = {
//   Camera: 1 << Components.Camera, // 1
//   Player: 1 << Components.Player, // 2
//   Position: 1 << Components.Position, // 4
//   Velocity: 1 << Components.Velocity, // 8
//   Finger: 1 << Components.Finger, // 16
//   Scale: 1 << Components.Scale, // 32
//   PanMode: 1 << Components.PanMode, // 64
// };

// // Archetype – Position + Velocity
// // Archetype – Position + Velocity + Player

// // const emptyArchetype = 0;
// // const positionVelocityArchetype = Has.Position | Has.Velocity; // 12

// // const archetypesByEntities: number[] = [];

// // for (let entity = 0; entity < archetypesByEntities.length; entity++) {
// //   if ((entity & positionVelocityArchetype) === positionVelocityArchetype) {
// //     // entity has Position and Velocity
// //   }
// // }

// // type Vector2Component = {
// //   x: number[];
// //   y: number[];
// // };

// // const PositionComponent: Vector2Component = {
// //   x: [],
// //   y: [],
// // };

// // const VelocityComponent: Vector2Component = {
// //   x: [],
// //   y: [],
// // };

// // const ScaleComponent: Vector2Component = {
// //   x: [],
// //   y: [],
// // };

// // type FingerComponent = {
// //   current: {
// //     onBoardPosition: Vector2Component;
// //     onCameraPosition: Vector2Component;
// //     isDown: boolean[];
// //   };
// //   previous: {
// //     onBoardPosition: Vector2Component;
// //     onCameraPosition: Vector2Component;
// //     isDown: boolean[];
// //   };
// // };

// // const FingerComponent: FingerComponent = {
// //   current: {
// //     onBoardPosition: {
// //       x: [],
// //       y: [],
// //     },
// //     onCameraPosition: {
// //       x: [],
// //       y: [],
// //     },
// //     isDown: [],
// //   },
// //   previous: {
// //     onBoardPosition: {
// //       x: [],
// //       y: [],
// //     },
// //     onCameraPosition: {
// //       x: [],
// //       y: [],
// //     },
// //     isDown: [],
// //   },
// // };

// // const PanMode: boolean[] = [];

// // // # PAN MODE SYSTEM

// // const panModeSystem: System<{
// //   cameraEntity: Entity;
// // }> = (world) => {
// //   const { cameraEntity } = world.ctx(world);

// //   if (FingerComponent.current.isDown[cameraEntity]) {
// //     World.addComponent(world, cameraEntity, Has.PanMode);
// //     PanMode[cameraEntity] = true;
// //   } else {
// //     World.removeComponent(world, cameraEntity, Has.PanMode);
// //   }
// // };

// // // # PLAYER FINGER

// // const playerFingerSystem = (): System<{
// //   playerEntity: Entity;
// //   cameraEntity: Entity;
// // }> => {
// //   const lastMouseData = {
// //     x: 0,
// //     y: 0,
// //     down: false,
// //   };

// //   document.body.onmousedown = () => {
// //     lastMouseData.down = true;
// //   };
// //   document.body.onmouseup = () => {
// //     lastMouseData.down = false;
// //   };
// //   document.onmousemove = (event) => {
// //     lastMouseData.x = event.pageX;
// //     lastMouseData.y = event.pageY;
// //   };

// //   return (world) => {
// //     const { playerEntity, cameraEntity } = world.ctx(world);

// //     FingerComponent.previous.onBoardPosition.x[playerEntity] = FingerComponent.current.onBoardPosition.x[playerEntity];
// //     FingerComponent.previous.onBoardPosition.y[playerEntity] = FingerComponent.current.onBoardPosition.y[playerEntity];
// //     FingerComponent.previous.onCameraPosition.x[playerEntity] =
// //       FingerComponent.current.onCameraPosition.x[playerEntity];
// //     FingerComponent.previous.onCameraPosition.y[playerEntity] =
// //       FingerComponent.current.onCameraPosition.y[playerEntity];
// //     FingerComponent.previous.isDown[playerEntity] = FingerComponent.current.isDown[playerEntity];

// //     FingerComponent.current.onCameraPosition.x[playerEntity] = lastMouseData.x;
// //     FingerComponent.current.onCameraPosition.y[playerEntity] = lastMouseData.y;
// //     FingerComponent.current.isDown[playerEntity] = lastMouseData.down;

// //     FingerComponent.current.onBoardPosition.x[playerEntity] =
// //       lastMouseData.x / ScaleComponent.x[cameraEntity] + PositionComponent.x[cameraEntity];
// //     FingerComponent.current.onBoardPosition.y[playerEntity] =
// //       lastMouseData.y / ScaleComponent.x[cameraEntity] + PositionComponent.x[cameraEntity];
// //   };
// // };

// // // # CAMERA SYSTEM

// // const cameraSystem: System<{ playerEntity: Entity; cameraEntity: Entity }> = (world) => {
// //   const { cameraEntity, playerEntity } = world.ctx(world);

// //   if (World.hasComponent(world, cameraEntity, Has.PanMode)) {
// //     PositionComponent.x[cameraEntity] -=
// //       FingerComponent.current.onCameraPosition.x[playerEntity] -
// //       FingerComponent.previous.onCameraPosition.x[playerEntity];
// //     PositionComponent.y[cameraEntity] -=
// //       FingerComponent.current.onCameraPosition.y[playerEntity] -
// //       FingerComponent.previous.onCameraPosition.y[playerEntity];
// //   }
// // };

// // // # MOVE SYSTEM

// // const moveQuery = Has.Position | Has.Velocity;

// // const moveSystem: System<Empty> = (world) => {
// //   for (let i = 0; i < world.entitiesArchetypes.length; i++) {
// //     if ((world.entitiesArchetypes[i] & moveQuery) === moveQuery) {
// //       PositionComponent.x[i] += VelocityComponent.x[i];
// //       PositionComponent.y[i] += VelocityComponent.y[i];
// //     }
// //   }
// // };

// // // # WORLD

// // const world = World.new((world) => {
// //   return {
// //     playerEntity: World.createEntity(world),
// //     cameraEntity: World.createEntity(world),
// //   };
// // });

// // const systems = [playerFingerSystem(), moveSystem, cameraSystem, panModeSystem];

// // World.step(world, systems);

// // AoS – Array of Structures

// const PositionComponentAoS = [
//   {
//     x: 0,
//     y: 0,
//   },
//   {
//     x: 0,
//     y: 0,
//   },
//   {
//     x: 0,
//     y: 0,
//   },
// ];

// // [x1,y1,x2,y2,x3,y3]
// // [x1,--,x2,--,x3,--]

// // SoA – Structure of Arrays

// const PositionComponentSoA = {
//   x: [0, undefined, 0, undefined, undefined, 0],
//   y: [0, undefined, 0, undefined, undefined, 0],
// };

// // [x1,x2,x3]
// // [y1,y2,y3]

// ---- ECS ----
var __values =
  (this && this.__values) ||
  function (o) {
    var s = typeof Symbol === 'function' && Symbol.iterator,
      m = s && o[s],
      i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === 'number')
      return {
        next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
        },
      };
    throw new TypeError(s ? 'Object is not iterable.' : 'Symbol.iterator is not defined.');
  };
// # !!! You can leave components as they are and not reset them,
// because if new entity use them it will reset values (SoA Pros)
export var World = {
  new: function (ctx) {
    return {
      entitiesArchetypes: [],
      graveyard: [],
      ctx: ctx,
    };
  },
  createEntity: function (world) {
    if (world.graveyard.length > 0) {
      return world.graveyard.pop();
    }
    return world.entitiesArchetypes.push(0) - 1;
  },
  destroyEntity: function (world, entity) {
    world.entitiesArchetypes[entity] = 0;
    world.graveyard.push(entity);
  },
  step: function (world, systems) {
    var e_1, _a;
    try {
      for (
        var systems_1 = __values(systems), systems_1_1 = systems_1.next();
        !systems_1_1.done;
        systems_1_1 = systems_1.next()
      ) {
        var system = systems_1_1.value;
        system(world);
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (systems_1_1 && !systems_1_1.done && (_a = systems_1.return)) _a.call(systems_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
  },
  addComponent: function (world, entity, hasComponent) {
    world.entitiesArchetypes[entity] |= hasComponent;
  },
  removeComponent: function (world, entity, hasComponent) {
    world.entitiesArchetypes[entity] &= ~hasComponent;
  },
  hasComponent: function (world, entity, hasComponent) {
    return (world.entitiesArchetypes[entity] & hasComponent) === hasComponent;
  },
};
// // ---- GAME ----
var Components;
(function (Components) {
  Components[(Components['Camera'] = 0)] = 'Camera';
  Components[(Components['Player'] = 1)] = 'Player';
  Components[(Components['Position'] = 2)] = 'Position';
  Components[(Components['Velocity'] = 3)] = 'Velocity';
  Components[(Components['Finger'] = 4)] = 'Finger';
  Components[(Components['Scale'] = 5)] = 'Scale';
  Components[(Components['PanMode'] = 6)] = 'PanMode';
})(Components || (Components = {}));
var Has = {
  Camera: 1 << Components.Camera,
  Player: 1 << Components.Player,
  Position: 1 << Components.Position,
  Velocity: 1 << Components.Velocity,
  Finger: 1 << Components.Finger,
  Scale: 1 << Components.Scale,
  PanMode: 1 << Components.PanMode, // 64
};
// Archetype – Position + Velocity
// Archetype – Position + Velocity + Player
var emptyArchetype = 0;
var positionVelocityArchetype = Has.Position | Has.Velocity; // 12
var archetypesByEntities = [];
for (var entity = 0; entity < archetypesByEntities.length; entity++) {
  if ((entity & positionVelocityArchetype) === positionVelocityArchetype) {
    // entity has Position and Velocity
  }
}
// type Vector2Component = {
//   x: number[];
//   y: number[];
// };
// const PositionComponent: Vector2Component = {
//   x: [],
//   y: [],
// };
// const VelocityComponent: Vector2Component = {
//   x: [],
//   y: [],
// };
// const ScaleComponent: Vector2Component = {
//   x: [],
//   y: [],
// };
// type FingerComponent = {
//   current: {
//     onBoardPosition: Vector2Component;
//     onCameraPosition: Vector2Component;
//     isDown: boolean[];
//   };
//   previous: {
//     onBoardPosition: Vector2Component;
//     onCameraPosition: Vector2Component;
//     isDown: boolean[];
//   };
// };
// const FingerComponent: FingerComponent = {
//   current: {
//     onBoardPosition: {
//       x: [],
//       y: [],
//     },
//     onCameraPosition: {
//       x: [],
//       y: [],
//     },
//     isDown: [],
//   },
//   previous: {
//     onBoardPosition: {
//       x: [],
//       y: [],
//     },
//     onCameraPosition: {
//       x: [],
//       y: [],
//     },
//     isDown: [],
//   },
// };
// const PanMode: boolean[] = [];
// // # PAN MODE SYSTEM
// const panModeSystem: System<{
//   cameraEntity: Entity;
// }> = (world) => {
//   const { cameraEntity } = world.ctx(world);
//   if (FingerComponent.current.isDown[cameraEntity]) {
//     World.addComponent(world, cameraEntity, Has.PanMode);
//     PanMode[cameraEntity] = true;
//   } else {
//     World.removeComponent(world, cameraEntity, Has.PanMode);
//   }
// };
// // # PLAYER FINGER
// const playerFingerSystem = (): System<{
//   playerEntity: Entity;
//   cameraEntity: Entity;
// }> => {
//   const lastMouseData = {
//     x: 0,
//     y: 0,
//     down: false,
//   };
//   document.body.onmousedown = () => {
//     lastMouseData.down = true;
//   };
//   document.body.onmouseup = () => {
//     lastMouseData.down = false;
//   };
//   document.onmousemove = (event) => {
//     lastMouseData.x = event.pageX;
//     lastMouseData.y = event.pageY;
//   };
//   return (world) => {
//     const { playerEntity, cameraEntity } = world.ctx(world);
//     FingerComponent.previous.onBoardPosition.x[playerEntity] = FingerComponent.current.onBoardPosition.x[playerEntity];
//     FingerComponent.previous.onBoardPosition.y[playerEntity] = FingerComponent.current.onBoardPosition.y[playerEntity];
//     FingerComponent.previous.onCameraPosition.x[playerEntity] =
//       FingerComponent.current.onCameraPosition.x[playerEntity];
//     FingerComponent.previous.onCameraPosition.y[playerEntity] =
//       FingerComponent.current.onCameraPosition.y[playerEntity];
//     FingerComponent.previous.isDown[playerEntity] = FingerComponent.current.isDown[playerEntity];
//     FingerComponent.current.onCameraPosition.x[playerEntity] = lastMouseData.x;
//     FingerComponent.current.onCameraPosition.y[playerEntity] = lastMouseData.y;
//     FingerComponent.current.isDown[playerEntity] = lastMouseData.down;
//     FingerComponent.current.onBoardPosition.x[playerEntity] =
//       lastMouseData.x / ScaleComponent.x[cameraEntity] + PositionComponent.x[cameraEntity];
//     FingerComponent.current.onBoardPosition.y[playerEntity] =
//       lastMouseData.y / ScaleComponent.x[cameraEntity] + PositionComponent.x[cameraEntity];
//   };
// };
// // # CAMERA SYSTEM
// const cameraSystem: System<{ playerEntity: Entity; cameraEntity: Entity }> = (world) => {
//   const { cameraEntity, playerEntity } = world.ctx(world);
//   if (World.hasComponent(world, cameraEntity, Has.PanMode)) {
//     PositionComponent.x[cameraEntity] -=
//       FingerComponent.current.onCameraPosition.x[playerEntity] -
//       FingerComponent.previous.onCameraPosition.x[playerEntity];
//     PositionComponent.y[cameraEntity] -=
//       FingerComponent.current.onCameraPosition.y[playerEntity] -
//       FingerComponent.previous.onCameraPosition.y[playerEntity];
//   }
// };
// // # MOVE SYSTEM
// const moveQuery = Has.Position | Has.Velocity;
// const moveSystem: System<Empty> = (world) => {
//   for (let i = 0; i < world.entitiesArchetypes.length; i++) {
//     if ((world.entitiesArchetypes[i] & moveQuery) === moveQuery) {
//       PositionComponent.x[i] += VelocityComponent.x[i];
//       PositionComponent.y[i] += VelocityComponent.y[i];
//     }
//   }
// };
// // # WORLD
// const world = World.new((world) => {
//   return {
//     playerEntity: World.createEntity(world),
//     cameraEntity: World.createEntity(world),
//   };
// });
// const systems = [playerFingerSystem(), moveSystem, cameraSystem, panModeSystem];
// World.step(world, systems);
// AoS – Array of Structures
var PositionComponentAoS = [
  {
    x: 0,
    y: 0,
  },
  {
    x: 0,
    y: 0,
  },
  {
    x: 0,
    y: 0,
  },
];
// [x1,y1,x2,y2,x3,y3]
// [x1,--,x2,--,x3,--]
// SoA – Structure of Arrays
var PositionComponentSoA = {
  x: [0, undefined, 0, undefined, undefined, 0],
  y: [0, undefined, 0, undefined, undefined, 0],
};
// [x1,x2,x3]
// [y1,y2,y3]

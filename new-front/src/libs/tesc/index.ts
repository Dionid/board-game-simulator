// // AoS string

// type Component = any;

// export type EntityId = string;

// type Entity = {
//     id: EntityId,
//     components: Component[]
// }

// type QueryCache = EntityId[]

// type World = {
//     entities: {
//         [entityId: EntityId]: Entity
//     }
//   components: Component[];
//   queries: {
//     byComponentName: {
//       [componentName: string]: QueryCache[];
//     };
//   };
// };

// const World = {
//   addComponent: (world: World, newEntityId: EntityId, componentName: string, component: Component) => {
//     world.components.push(component);

//     // # Add this entity to all queries that have this component
//     const { queries } = world;

//     for (const entityList of queries.byComponentName[componentName]) {
//       // OPTIMIZE
//       if (entityList.some((entity) => entity === newEntityId)) {
//         continue;
//       }
//       entityList.push(newEntityId);
//     }
//   },
//   removeComponent: (world: World, entityId: EntityId, componentName: string, component: Component) => {
//     // OPTIMIZE
//     world.components.splice(world.components.indexOf(component), 1);

//     // # Remove this entity from all queries that have this component
//     const { queries } = world;

//     for (const entityList of queries.byComponentName[componentName]) {
//       // OPTIMIZE
//       entityList.splice(entityList.indexOf(entityId), 1);
//     }
//   },
//   destroyEntity: (world: World, entityId: EntityId) => {
//     // # Remove this entity from all queries
//     const { queries } = world;

//     // OPTIMIZE
//     for (const componentName of Object.keys(queries.byComponentName)) {
//       for (const entityList of queries.byComponentName[componentName]) {
//         entityList.splice(entityList.indexOf(entityId), 1);
//       }
//     }
//   },
//   registerNewQuery: (world: World, componentNames: string[], entityList: EntityId[]) => {
//     const { queries } = world;

//     for (const componentName of componentNames) {
//       if (!queries.byComponentName[componentName]) {
//         queries.byComponentName[componentName] = [];
//       }

//       queries.byComponentName[componentName].push(entityList);
//     }

//     return;
//   },
// };

// const Query = {
//   new: (world: World, componentsNames: string[]) => {
//     const entitiesWithComponents: QueryCache = [];

//     World.registerNewQuery(world, componentsNames, entitiesWithComponents);

//     return (): QueryCache => {
//       return entitiesWithComponents;
//     };
//   },
// };

// const VelocityComponent = {};

// const PositionComponent = {};

// const world: World = {
//     entities: {},
//   components: [],
//   queries: {
//     byComponentName: {},
//   },
// };

// const velocityQuery = Query.new(world, ['VelocityComponent', 'PositionComponent']);

// const movementSystem = (world: World) => {
//   const entitiesWithVelocityAndPosition = velocityQuery();

//   for (const entity of entitiesWithVelocityAndPosition) {
//     // const velocity = entity.components[0]
//     // const position = entity.components[1]

//     // position.x += velocity.x
//     // position.y += velocity.y
//     console.log('entity', entity);
//   }

//   console.log('DONE');
// };

// World.addComponent(world, 'EntityId1', 'VelocityComponent', VelocityComponent);
// World.addComponent(world, 'EntityId2', 'PositionComponent', PositionComponent);

// movementSystem(world);

// World.removeComponent(world, 'EntityId1', 'VelocityComponent', VelocityComponent);

// movementSystem(world); // Must contain only EntityId2

// World.destroyEntity(world, 'EntityId2');
// World.addComponent(world, 'EntityId3', 'PositionComponent', PositionComponent);

// movementSystem(world); // Must be empty

// World.addComponent(world, 'EntityId3', 'VelocityComponent', VelocityComponent);

// movementSystem(world); // Must contain only EntityId3

export type T = void;

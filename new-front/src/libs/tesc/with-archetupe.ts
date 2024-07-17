// // type ComponentId = number;

// // type EntityId = number;
// // type EntityType = ComponentId[];

// // const entityIndex: Record<EntityId, EntityType> = {};

// // const hasComponent = (entityId: EntityId, componentId: ComponentId) => {
// //     return entityIndex[entityId].includes(componentId);
// // }

// // Problem: every Entity will have similar EntityType array – thats too fat
// // Solution: Archetype – created only once per EntityType

// // type ComponentId = number;

// // type EntityId = number;
// // type EntityType = ComponentId[];

// // type Archetype = {
// //     entityType: EntityType
// //     typeSet: Set<ComponentId>
// // }

// // const entityIndex: Record<EntityId, Archetype> = {};

// // const hasComponent = (entityId: EntityId, componentId: ComponentId) => {
// //     return entityIndex[entityId].typeSet.has(componentId);
// // }

// // Problem: there will be much more Archetypes, than Components
// // Solution: flip them arraound

// type Component = {};
// type ComponentId = string;

// type EntityId = number;
// type EntityType = ComponentId[];

// type ArchetypeId = number;

// type Column = Component[];

// type ArchetypeEdge = {
//   add?: Archetype;
//   remove?: Archetype;
// };

// type Archetype = {
//   id: ArchetypeId;
//   entityType: EntityType;
//   components: Column[];
//   edges: Record<ComponentId, ArchetypeEdge>;
// };

// type ArchetypeMap = Record<ArchetypeId, number>;

// const componentIndex: Record<ComponentId, ArchetypeMap> = {};

// const archetypeIndex: Map<EntityType, Archetype> = new Map();

// type EntityIndexItem = {
//   archetype: Archetype;
//   row: number;
// };
// const entityIndex: Record<EntityId, EntityIndexItem> = {};

// const hasComponent = (entityId: EntityId, componentId: ComponentId): boolean => {
//   const entityIndexItem = entityIndex[entityId];
//   const archetypeMap = componentIndex[componentId];
//   return archetypeMap[entityIndexItem.archetype.id] !== undefined;
// };

// // const getEntitiesByComponents = (entityType: EntityType): EntityId[] => {
// //     const archetype = archetypeIndex.get(entityType)
// // }

// const getComponent = (entityId: EntityId, componentId: ComponentId) => {
//   const entityIndexItem = entityIndex[entityId];
//   const archetype = entityIndexItem.archetype;

//   const componentArchetypesMap = componentIndex[componentId];
//   if (!componentArchetypesMap[archetype.id]) {
//     return undefined;
//   }

//   return archetype.components[componentArchetypesMap[archetype.id]][entityIndexItem.row];
// };

// const moveEntity = (archetype: Archetype, row: number, componentId: ComponentId, nextArchetype: Archetype) => {
//   const componentArchetypesColumn = componentIndex[componentId];
//   const column = archetype.components[componentArchetypesColumn[archetype.id]];
//   const component = column[row];
//   // # Delete from old archetype
//   column.splice(row, 1);
//   // ...
//   // # Add to new archetype
//   nextArchetype.components[componentArchetypesColumn[nextArchetype.id]][row] = component;
//   // ...
// };

// const addComponent = (entityId: EntityId, componentId: ComponentId) => {
//   const entityIndexItem = entityIndex[entityId];
//   const archetype = entityIndexItem.archetype;
//   let nextArchetype = archetype.edges[componentId].add;
//   if (!nextArchetype) {
//     const entityType = [...archetype.entityType, componentId];
//     // TODO: THIS WILL NOT WORK, BECAUSE entityType IS UNIQUE ARRAY
//     nextArchetype = archetypeIndex.get(entityType);
//     if (!nextArchetype) {
//       nextArchetype = {
//         id: 0,
//         entityType,
//         components: [],
//         edges: {},
//       };
//       archetypeIndex.set(entityType, nextArchetype);
//     }
//     archetype.edges[componentId].add = nextArchetype;
//   }
//   moveEntity(archetype, entityIndexItem.row, componentId, nextArchetype);
// };

// const removeComponent = (entityId: EntityId, componentId: ComponentId) => {
//   const entityIndexItem = entityIndex[entityId];
//   const archetype = entityIndexItem.archetype;
//   let nextArchetype = archetype.edges[componentId].remove;
//   if (!nextArchetype) {
//     const entityType = archetype.entityType.filter((id) => id !== componentId);
//     // TODO: THIS WILL NOT WORK, BECAUSE entityType IS UNIQUE ARRAY
//     nextArchetype = archetypeIndex.get(entityType);
//     if (!nextArchetype) {
//       nextArchetype = {
//         id: 0,
//         entityType,
//         components: [],
//         edges: {},
//       };
//       archetypeIndex.set(entityType, nextArchetype);
//     }
//     archetype.edges[componentId].add = nextArchetype;
//   }
//   moveEntity(archetype, entityIndexItem.row, componentId, nextArchetype);
// };

export type T = void;

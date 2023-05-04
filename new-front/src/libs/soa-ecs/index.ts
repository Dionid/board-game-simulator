/**
 * # Why do we have problem with EntityId allocation in the first place:
 *
 * 1. Right now im synchronizing component changes in p2p manner -> Every change sends data about delta to other peers
 * In this situation every change of the component will be synced as it is + every player system is calculating only
 * its own changes
 *
 * 2. There are over ways of synchronization: Sync only user inputs and calculate all other stuff on the client side -> Right now problem will be with events
 *
 * PROS of component sync:
 * - I can calculate everything assossiated with player on his side and send deltas
 *
 * CONS of component sync:
 * – Without CRDT I can't do it in a simple way
 * – Data transfer is huge
 * – Queries must also be synced OR I must check on client if new components arrived and add them to queries
 *
 * PROS of input sync:
 * – Data transfer is small
 *
 *
 * ! I can assume that using Local and Shared components will be the best way to go in all cases
 *
 *
 * I think its better just to stick to current architecture, till first MVP will be completed
 *
 */

// The main id is how we allocate IDS (Entities)
// 1. If we allocate it throw server, the only problem will be ping
// How can we avoid this: allocate ids upperhand and

// -> Main thing right now: we need to add newEntity to world

// While using UUID I can be sure that there will be no collisions
// but in future I can swap in to server generated uint32 ids

// # Operations
// 1. Create entity – allocate ID
// 1. Add component to entity
// 1. Remove component from entity
// 1. Query all entities by components (const ents = Essence.getEntitiesByComponents(essence, [ComponentName]))
// 1. Change component of entity
// 1. Delete entity – remove all components from ID (free ID)

// # By frequency
// 1. Query all entities by components
// 1. Change component of entity
// 1. Add component to entity
// 1. Remove component from entity
// 1. Create entity
// 1. Delete entity

// # Query cashing
// 1. Because we are creating and deleting entities very often, we CAN create queries that will cache entities by components
// 1. They will be affected on (1) add component to entity, (2) remove component from entity, (3) delete entity

// # UUID + Query cashing
// 1. Query all entities by components
// This can be done by Query cashing
// - Add component to entity -> Get all queries by this component -> Add entity to there queries
// - Remove component from entity -> Get all queries by this component -> Remove entity from there queries
// 1. Change component of entity
// - Get all components by query ->

export type T = void;

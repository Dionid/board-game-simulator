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
export {};

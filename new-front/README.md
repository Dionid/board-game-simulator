# BSG Client

1. GO
   1. Delete
   1. Change Depth
1. ...

# Future

1. Remove float numbers
1. ESC
   1. Distinct Shared and Local data
      1. There can be Shared component pools and maybe queries in the future
      1. Local data: events + local component pools + ? queries
1. Deffer entity and component creation to next loop
1. UseMonitor / Query entered
1. Queries
1. Serverside Entity Ids
1. SoA instead of AoS

# Done

1. ~~Maybe change playerEntityId to be playerId (than it will be simpler to check if we are this player)~~
1. ~~Maybe change EntityId and ComponentId just to string~~
1. ~~Three main goals~~
   1. ~~Event system~~
      1. ~~MVP~~
      1. ~~Make sure they are created exactly before run start~~
   1. ~~State Sync~~
      1. ~~Now observable can fire even in between `Pool.add` (like adding GameObject, than Position). Problem is: if I'm trying to get entity and think that that it will be with all components.~~
   1. ~~Depth~~
      1. ~~We can create index for every object + Add some system, that will resort than (1) new GameObject spawned and (2) object depth has changed~~
1. ~~ESC~~
   1. ~~Optimize pools (remove names and no nested)~~
   1. ~~Optimize component~~
   1. ~~Add events immediately~~

I need to decide right now about EntityId:

1. If i use uint32, than i need some kind of decision of how to generate them:
   1. It can be done locally if this is singleplayer
   1. It can be done on server if this is multiplayer

Main benefits i get from using uint32:

1. I can store all components in arrays where eid will be index
1. It will give me ability to implement SoA
1. It will be standard

1. Get entity ids by components
   1. Cache of components intersection (add component / remove component / delete entity)
   1. In all this operations we can form not only entities, but also components
1. Get components by entity and check / change them
   1. ...
1. Add components
   1. Invalidate queries
1. Remove components
1. Remove entities
1. Add entities

AoS

1. I don't need to save every component on entity
1. ...

# TECS

1. ~~Graveyard~~
1. ~~? SparseSet for archetypeByMask~~ to big mask in key
1. ~~Archetype Query~~
1. ~~Create systems~~
1. ~~World step~~
1. ~~Beautiful components~~
1. ~~REVERSE FOR LOOP ORDER~~
1. ~~Deffer create / delete / addComponent / removeComponent~~
1. ~~Bitwise is just 31 components...~~
1. ~~Archetype Queries (I can reuse them by name in world.queriesByName)~~
1. Check
   1. Spawn entity
   1. Destroy entity
   1. Add component
   1. Remove component
1. Query NOT
1. Prefabricate
1. CDC
1. Make BitSet immutable
1. Schema
1. Ctx
1. Events
1. Hooks
1. World method to add systems (with Phase)
1. ? Make components unique by name?
1. ? Sparse Map (https://github.com/3mcd/harmony-ecs/blob/main/lib/src/sparse_map.ts)

## Tecs

TECS is mainly indexed entities by archetypes:

1. When we create entity we (1) allocate new entityID (from graveyard or create new one), (2) assign in to EmptyArchetype;
1. When we delete entity we put it in GraveyardArchetype
1. When we add / remove component, we move entity to another archetype (meaning it's just tagging)

Actual data is stored as developer wish it, BUT it must somehow be indexed by entity id.

## Networking

1. Main points:

   1. ComponentIds must be the same on all nodes -> This can be done just by hardcode
   1. EntityIds must be the same on all nodes -> This can be done by allocating them on server (beforehand)
   1. I think I will like to save some not serializable data on client. Problem is:
      1. I can't not serialize some of the Archetypes, because they can contain some data that I need to sync
      1. So if I want some kind of "blacklist", it must be on Component level (not Archetype)

1. Problems:

   1. ...

1. Tasks
   1. Add entityId allocation on server

## CDC

Main idea is: check if there is new entity or one of them were deleted.

This can be done by:

1. Storing "newEntities" and "deletedEntities" in archetype
1. Using functions that will calculate this delta (like useChangedHook)

### Archetype way

100% NO: allocations on every archetype is so massive, that it will kill performance

- in the end of every step we need to clear "newEntities" and "deletedEntities"

* we can assign entity storages size
* this will be done once per step

### useChangedHook way

- ~~this will be done every time we call useChangedHook~~ –> This can be mitigated by calculating this only once per step (useMemo like)

* Only on needed archetypes
* Query mask can be used as id, so I can store all of them globally (like on world), to reuse them

---

# BGS

1. 100% it must be peer-to-peer
   1. World state must live on every client browser for offline
   1. **I must not** make some state local right now

---

# Multiplayer

## READ

1. General replication of entities (https://0fps.net/2014/02/10/replication-in-networked-games-overview-part-1/)
1. Remote entity interpolation
1. Backwards reconciliation
1. Game synchronized clocks (quantization)
1. Matter ECS Replication (https://eryn.io/matter/docs/Guides/Replication)
1. Unreal Engine 5 Multiplayer
   1. https://www.youtube.com/watch?v=ef6SeknakeU
   1. https://www.youtube.com/results?search_query=unreal+engine+5+multiplayer+

## Thoughts

1. I want to do it without server -> it will be in P2P manner:
   1. Every client will have private and shared state
   1. Shared state can be synchronized in "Last Write Wins" manner
1. Entity Ids must be the same on all clients
   1. Because of p2p we need to clients agree on entity ids spaces, like:
      1. Every client will allocate X ids and when they are over, it will pass X \* N-players for next X ids
1. There must be some shared part and some private part
   1. We will share
      1. Position
      1. Depth
      1. Size
      1. View
      1. Selectable
      1. Selected
   1. We need to hide
      1. Camera
      1. Picked card (View + Metadata)
1. We need to somehow bind state to time
   1. ? It will be time or step based?

## Host-based

There will be 2 ECS worlds:

1. Player World – one that send inputs and receive state from host
2. Host world – one host that will receive inputs and send state to all clients

### Matchmaking

1. First player will be Host
1. Every new player will check for host and connect to it
1. Host will send it's current state to new player

### Losing host

1. If host is disconnected (event on transport), next player by serial number will become host
   taking hist current state and sending it to all players.

### Buffers

1. (Circular)WriteBuffer – data to be sent to host
1. (Circular)ReadBuffer – data to be read from player

### Player world

1. Init
   1. On every message from Host save it in "LastHostState"
1. Step
   1. Read data from "LastHostState", apply it to world (using interpolation) and set WriteBuffer offset to `current - X`
   1. Get and push inputs to WriteBuffer and increment offset
   1. Get and push events to WriteBuffer and increment offset
   1. Send all buffered inputs and events to host from offset to current

If current become too long, we try to reconnect to host and get all state.

### Host world

1. Init
   1. On every message from Player save it in ReadBuffer
1. Step
   1.

## P2P

NO because it's too hard to implement

### Entity ID Allocation

X – range per player

1. Connect to peers
1. If there is none, save your id, to Room
1. If there are
1. Send your id
1. Get their current ids
1. Allocate next X ids for yourself

1: [0000-1000] - [2000-3000] - [5000-6000] - [8000-9000]
2: [1000-2000] --------------- [4000-5000] - [7000-8000]
3: ------------- [3000-4000] – [6000-7000] - [9000-10000]

### Entity ID Destroy

1. Every player will put private entity ids in their graveyard and
   shared entity ids in shared graveyard.
2. You can reallocate only from private graveyard

# Component sync

## Cursor movement

1. Every player will have their own Cursor
1. Cursor = Position + Size + View
1. On init you are allocating Cursor entity
   and adding component data (Position = board center,
   Color = random, Size = fixed)
   1. This will set Cursor Entity to PositionSizeViewArchetype (PSVA)
1. If we send full PSVA
   1. WE CANT DO THIS, because there is a dense array of entity ids
1. If we send "Added entity to PSVA" (Event / CDC)
   1. If we send delta, than we need to know "what last event has been acked by other players"

### Deterministic Lockstep

Main problem: what if player loses connection and stopped sending inputs?

1. We store all indputs (or may be last 1 minute)
1. We send buffer of X inputs
1. And get ack from players
1. If we get ack, than repeat
1. If we don't get ack ->
1. Store X of inputs + 1 for every unsynced player

!!! Or we can use offset

1. When we got all inputs from player, we push it to all input array, replay gamestate backwards to
   timestamp where we got last ack and than replay all inputs from that point + do it quicker OR don't show it at all

And if this lag is much more, than just serialize the state and send to player

### Snapshot / State Sync

In P2P main problem are conflicts: what if we both created entity and added to to same archetype.
The only way it can be solved is by CRDT.

In Host-based we can send all the inputs to one player and he will be responsible for all the state,
EXCEPT our local state.

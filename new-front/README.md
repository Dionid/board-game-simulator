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
1. Bitwise is just 31 components...
1. Prefabricate (does piecs prefabricate ALL variants)
1. Archetype Queries (I can reuse them by name in world.queriesByName)
1. CFC
1. Ctx
1. Events
1. Hooks
1. World method to add systems (with Phase)
1. ? Save component stores alonside with archetypes
1. ? Sparse Map (https://github.com/3mcd/harmony-ecs/blob/main/lib/src/sparse_map.ts)

## Components

1. Must be created in harcoded sequence -> Can be done by `world.registerComponent`
1. !!! We must somehow resize components -> Then we need to create Schema

## Defer

1. Harmony uses Cash to destroy entities, add and remove components (https://github.com/3mcd/harmony-ecs/blob/main/lib/src/cache.ts)
1. Javeline do it by default (https://github.com/3mcd/javelin/blob/master/packages/ecs/src/world.ts)

## Tecs

TECS is mainly indexed entities by archetypes:

1. When we create entity we (1) allocate new entityID (from graveyard or create new one), (2) assign in to EmptyArchetype;
1. When we delete entity we put it in GraveyardArchetype
1. When we add / remove component, we move entity to another archetype (meaning it's just tagging)

Actual data is stored as developer wish it, BUT it must somehow be indexed by entity id.

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

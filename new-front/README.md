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
1. Archetype Query
1. Create systems
1. World step
1. Beautiful components
1. Prefabricate
1. Ctx
1. Events
1. ? Deffer create / delete / addComponent / removeComponent

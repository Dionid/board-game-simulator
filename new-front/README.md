# BSG Frontend

1. Maybe mark some Component Pools to be not synced OR even some Components
1. ...

1. Maybe change playerEntityId to be playerId (than it will be simpler to check if we are this player)
1. ~~Maybe change EntityId and ComponentId just to string~~
1. Three main goals
   1. ~~Event system~~
      1. ~~MVP~~
      1. ~~Make sure they are created exactly before run start~~
   1. ~~State Sync~~
      1. ~~Now observable can fire even in between `Pool.add` (like adding GameObject, than Position). Problem is: if I'm trying to get entity and think that that it will be with all components.~~
   1. Depth
      1. We can create index for every object + Add some system, that will resort than (1) new GameObject spawned
         and (2) object depth has changed
      1.
1. ESC
   1. Optimize component
      1. Remove name
      1. Remove id
   1. Optimize pools (remove names and no nested)
   1. Restructure Essence
      1. Distinct Shared and Local data
         1. There can be Shared component pools and maybe queries in the future
         1. Local data: events + local component pools + ? queries
   1. ~~Add events immediately~~
1. Future
   1. Ad-hoc queries
      1. On every

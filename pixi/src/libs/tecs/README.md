# Design

1. Id – number id
1. Entity – number id to bind Components to
1. Schema – describes component shape (data structure) and Component serialization / deserialization rules
1. Component – instance of Schema
1. Archetype – identified by Components and contains dense Entities and Components
1. Query – described by Component filters, returns Archetype pointers containing
1. World – contains Entities, Archetypes, Queries and indexes
1. Internals – contains registered Schemas

# Decision

1. BitSet 100%
1. SparseSet 100%
1. Components must exist in runtime -> Use schema
1. ...

# TODO

1. ~~Add Component (with Archetype shift)~~
1. ~~Has Component~~
1. ~~Remove Component (with Archetype shift)~~
1. ~~Prefabricate Archetype~~
1. ~~Query~~
1. ~~Tags~~
1. ~~Types: Boolean, Array ~~
1. ~~Defer add and remove entities and components on the same World.step or deferred~~
1. ~~Topics~~
1. ...
1. Complex queries
1. Singleton Component
1. Change detection
1. Union type Field
1. State Machine
1. ...
1. Register System before / after other System
1. SoA components
1. World size
1. BitMask
1. Custom Errors
1. ...

# Goals

1. ~~Try to separate storage and ECS engine, to use ECS engine just as index~~.
   Better to make so that person doesn't need to know about storage.
1. ...

# Ideas

1. I can create Archetype Type, just by concating sorted component ids
1. ??? Global SparseSet with components
1. ...

# Thoughts

1. Вспомнил почему плохая идея использовать 1 большой ComponentTable:
   проблема в том, что итерация по нему не получится последовательной, так как
   мы будем брать только часть компонентов. Поэтому лучше хранить компоненты в Archetype

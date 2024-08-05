# Design

1. Id – number id
1. Entity – number id to bind Components to
1. Schema – describes component shape (data structure) and Component serialization / deserialization rules
1. Component – instance of Schema
1. Archetype – identified by Components and contains dense Entities and Components
1. Query – described by Component filters, returns Archetype pointers containing
1. Essence – contains Entities, Archetypes, Queries and indexes
1. Internals – contains registered Schemas
1. Event Driven – create custom events
1. Change Detection – contains changes to Entities and Components

# Features

1. Schema -> string, number, boolean, array, typed, union, literal
1. ...

# TODO

1. ~~Add Component (with Archetype shift)~~
1. ~~Has Component~~
1. ~~Remove Component (with Archetype shift)~~
1. ~~Prefabricate Archetype~~
1. ~~Query~~
1. ~~Tags~~
1. ~~Types: Boolean, Array ~~
1. ~~Defer add and remove entities and components on the same Essence.step or deferred~~
1. Add empty Archetype to new entities -> Add `newComponent` to `moveEntity` -> Change `setComponent`, to `updateComponent`
1. Debug
1. ...
1. Complex queries
1. Singleton Component
1. Union type Field
1. State Machine
1. ...
1. Register System before / after other System
1. SoA components
1. Essence size
1. BitMask
1. Custom Errors
1. ...

# Ideas

1. I can create Archetype Type, just by concating sorted component ids
1. ...




# Decision

1. BitSet 100%
1. SparseSet 100%
1. Components must exist in runtime -> Use schema
1. ...

# TODO

1. Add Component (with Archetype shift)
1. Has Component
1. Remove Component (with Archetype shift)
1. Prefabricate Archetype
1. Query
1. Tags
1. Types: Boolean, Array, Object, Set, Map [link](https://github.com/3mcd/javelin/blob/2b64cfa78e016675e698da8299c36b9d4f431e27/packages/pack/src/views.ts)
1. ? Change Component back to Schema
1. ...
1. BitMask
1. Singleton Component
1. Component pools
1. Custom Errors
1. ...
1. World size
1. ...

# Goals

1. ~~Try to separate storage and ECS engine, to use ECS engine just as index~~.
    Better to make so that person doesn't need to know about storage.
1. ...

# Ideas

1. I can create Archetype Type, just by concating sorted component ids
1. ??? Global SparseSet with components
2. ...

# Thoughts

1. Вспомнил почему плохая идея использовать 1 большой ComponentTable:
    проблема в том, что итерация по нему не получится последовательной, так как
    мы будем брать только часть компонентов. Поэтому лучше хранить компоненты в Archetype
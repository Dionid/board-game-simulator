# addEntity

## Process

1. Allocate ID from removed ids or totally new one
2. If allocated id is more than size of world (size means size of entities), throw error
3. ?? Add entity to world.SparseSet
4. Map eid and world
5. Add it to match queries (mainly empty queries)
6. Create new Set of components on world (world.EntityComponent)

## Comments

1. A lot of allocations been done (from 2-d to 6-th points)

# removeEntity

1. Check if world.SparseSet has eid
1. Remove from all queries
1. Push to removed
1. Remove from world.SparseSet
1. Remove from world.EntityComponent
1. ?? Remove from deserializer mapping
1. ?? Clear entity bitmasks

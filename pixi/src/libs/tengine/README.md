# Roadmap

1. ~~Add collider~~
1. ? Add RigidBody (because velocity and acceleration must be part of RigidBody)
1. SAT
    1. SAT collision detection
    1. Calc MTV
    1. MTV Collision resolution
1. Dedup collision pairs
1. What is Constraints (matter.js)
1. ...
1. Preload assets
1. Culling
1. ...
1. Top-down Tilemap
1. ...
1. Tweens
1. ...
1. ? Fixed update
1. ? Convert scale from float to int

# Features

1. Game loop
1. Camera (zoom, pan, world bounds, move)
1. Render Pixi Graphics
1. Tilemap (isometric)
1. Animations
1. Debug
1. Input (keyboard, mouse)

# Entities

1. Basic
    1. Canvas is html canvas element
    1. Essence is ECS engine
    1. Container is pixi elements container
    1. Input input interface data
    1. Camera is virtual object determines position, size and zoom of what we see
    1. App is pixi.Application
1. Complex
    1. Map has Container, Size, pixi elements
    1. World has Container, Maps and size
1. Game
    1. Game has Canvas, Essence, Camera, Input, App, World
1. GameObject (GO)
    1. GO can have
        1. Position
        1. Rotation
        1. (???) Size
        1. Sprite
            1. Position
            1. Texture
            1. Size
            1. Rotation
            1. Scale
            1. Anchor
        1. Collider
            1. Shape
            1. Size
            1. Position
            1. Rotation
            1. Type (Solid, Sensor)
        1. RigidBody
            1. Type (Static, Kinematic, Dynamic)
            1. Acceleration
            1. Velocity
            1. Position
            1. Rotation
            1. CollidersList
    1. As components
        1. Acceleration
        1. Velocity
        1. Position
        1. Rotation
        1. Sprite
        1. CollidersList

# Caution

1. It's better not to change Camera size directly, use zoom for this
1. ...

# Collision

1. Phases
    1. Broad
    1. Narrow
    1. Response

1. ...


# Useful links

1. Isometric
    1. Rendering isometric map (https://melmouk.medium.com/algorithm-to-render-isometric-maps-3d86d1a49713)
    1. Cartesian to Iso
        1. https://codepen.io/StefanH/pen/qBgVPaQ
        1. https://gist.github.com/jordwest/8a12196436ebcf8df98a2745251915b5
        1. https://www.youtube.com/watch?v=04oQ2jOUjkU
1. Collision
    1. https://www.youtube.com/watch?v=eED4bSkYCB8
    1. https://brm.io/game-physics-for-beginners/
    1. https://www.toptal.com/game/video-game-physics-part-ii-collision-detection-for-solid-objects
    1. SAT
        1. https://github.com/xSnapi/SAT-Collision
1. Physics
    1. https://www.youtube.com/watch?v=3lBYVSplAuo
    1. RigidBody
        1. https://rapier.rs/docs/user_guides/rust/rigid_bodies


# Questions

1. Updates
    1. How to updates involving minFPS and physics
1. Acceleration, Velocity, Position, Translation
    1. ! Are components of RigidBody 
    1. ! Meaning
        1. Acceleration is how fast velocity changes
        1. Velocity is how fast position changes
        1. Position is where object is
        1. Translation is change in Position
    1. Do we need to change acceleration over time
    1. How to change only velocity
        1. Maybe acceleration must not be part of engine
    1. How speed must work (where to apply it)
    1. linear / angular velocity
    1. Do Acceleration works with Kinematic
1. Collision
    1. ! Types
        1. Solid – generate Contact and CollisionEvents
        1. Sensor – generate only CollisionEvents (can pass through)
1. Scene Queries (https://rapier.rs/docs/user_guides/rust/scene_queries/)
1. Depth Sorting
1. Units (https://rapier.rs/docs/user_guides/rust/common_mistakes#why-is-everything-moving-in-slow-motion)
1. ...

# Notes

!!! RigidBody это про то, чтобы объекты не попадали друг в друга
!!! Рассчет новой позиции -> Проверка коллизий и корректировка новой позиции -> Применение новой позиции

1. Collision is one process and Collision Reaction must base on type of RigidBody
    1. Loop must be something like: apply forces -> check for collision -> apply collision reaction
1. RigidBody
    1. Static
        1. Move – false
        1. Affect others – true
        1. Affected by others – false
        1. Collision events – ???
            1. Rapier – only with dynamic
    1. Kinematic (PositionBased / VelocityBased)
        1. Move – true
        1. Affect others – true
        1. Affected by others – false
        1. Collision events – ???
            1. Rapier – only with dynamic
    1. Dynamic
        1. Move – true
        1. Affect others – true
        1. Affected by others – true
        1. Collision events – all
1. Collisions
    1. Attached to RigidBody
1. We can lock translation or rotation (https://rapier.rs/docs/user_guides/rust/rigid_bodies#locking-translationsrotations)
1. Sleeping


1. Make so that we firstly calc new position, then check collision, than resolve it


# Matter

1. Apply Gravity to Forces

1. Collision Response
    1. Update Bodies
        1. Body ->
                Change Velocity -> Save previous position -> Apply Velocity to Position
                -> Change AngularVelocity -> Save prev Angle -> Apply AngularVelocity to Angle
            -> For Parts
                -> Translate parts vertices -> Apply body velocity tp parts.position
                -> Rotate Parts
                -> Update bounds
    1. Constraints
        1. PresolveAll ???
        1. Solve All
    1. Detect collisions
    1. Update collision Pairs
    1. Wake up bodies
    1. CollisionStartEvent on new Pairs
    1. (!!!) SolvePosition
        1. preSolvePosition -> set total contacts
        1. solvePosition (find impulses required to resolve penetration)
            1. ```
                pair.separation =
                collision.depth +
                collision.normal.x * (bodyB.positionImpulse.x - bodyA.positionImpulse.x) +
                collision.normal.y * (bodyB.positionImpulse.y - bodyA.positionImpulse.y);
                ```
            1. positionImpulse = pair.separation - pair.slop * slopDampen;
            1. if body not static and not sleeping apply impulse
                ```
                bodyA.positionImpulse.x +=
                  normal.x * positionImpulse * contactShare;
                bodyA.positionImpulse.y +=
                  normal.y * positionImpulse * contactShare;
                ```
        1. postSolvePosition (apply impulses to all bodies)
            1. for bodies
                1. reset totalContacts
                1. If there is any positionImpulse
                    1. verticesTranslate
                    1. boundsUpdate
                    1. ??? move previous body position without changing velocity
                    1. ??? Reset cached impulse if the body has velocity along it OR
                    warm the next iteration (by reducing it)

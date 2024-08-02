# TODO

1. ~~SAT~~
1. ~~Change render logic to pView~~
1. ~~Change debug to pView~~
1. ~~Leave rectangle and circle colliders~~
1. ~~Add vertices to Collider~~
1. ~~Rotate Collider with different pivots~~
1. ~~Add Rotation to Colliders rotation (changing position and vertices)~~
1. ~~Add Normal Axes to Collider~~
1. ~~Line~~
1. World bounds

# Roadmap

1. View
    1. Capsule
    1. Polygon
    1. Change to ViewSet
    1. On entity kill destroy pView
    1. Scale
1. ECS
    1. Default topics (ComponentAdded, ComponentRemoved, ComponentChanged, EntitySpawned, EntityKilled)
1. Collision
    1. ~~SAT~~
    1. ~~Raw Vertices~~
    1. ~~Compound / Composite~~
    1. ~~Capsule on Compound~~
    1. ~~Pairs + Dedup~~
    1. ~~Awaken / Asleep~~
    1. ~~Triangle on Vertices~~
    1. Polygon on Vertices
    1. Collision Queries
    1. Angular velocity
    1. World Bounds
    1. Fix Circle anchor
    1. Separate concave to convex
    1. Chamfer
1. Physics
    1. Rotation
    1. OnComponentAdded
        1. Check in physics, that there is no RigidBodyType + Impenetrable
    1. Joints
1. Character movement
    1. Move and slide
1. ...
1. Preload assets
1. Culling
1. ...
1. Top-down Tilemap
1. ...
1. Tweens
1. ...

# Features

1. Game loop
1. Camera (zoom, pan, world bounds, move)
1. Pixi renderer
1. Tilemap (isometric)
1. Animations
1. Debug
1. Input (keyboard, mouse)
1. Collision
    1. Circles, Rectangles and Vertices
    1. Narrow (on SAT)

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

# Components

## Top level Components

Most of other components will depend on these ones

1. **Position** – position in the World
1. **Velocity** – speed of object (change in position)
1. **Acceleration** – speed of speed (change in velocity)
1. **Scale** – size of object
1. **Rotation** – ...
1. **Lock Translation** – lock object from changing position in x / y axis
1. **Lock Rotation** – lock object from rotating in x / y axis
1. **Lock Scale** – lock object from scaling in x / y axis

## View

...

## Collision

1. Phases
    1. Broad
    1. Narrow
    1. Response
1. ...

## Physics

1. RigidBody Types
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

## Caution

1. It's better not to change Camera size directly, use zoom for this
1. Colliders and Physics must be calculated before everything else
1. ...


# Useful links

1. Isometric
    1. Rendering isometric map (https://melmouk.medium.com/algorithm-to-render-isometric-maps-3d86d1a49713)
    1. Cartesian to Iso
        1. https://codepen.io/StefanH/pen/qBgVPaQ
        1. https://gist.github.com/jordwest/8a12196436ebcf8df98a2745251915b5
        1. https://www.youtube.com/watch?v=04oQ2jOUjkU
1. Collision
    1. https://www.youtube.com/playlist?list=PLo6lBZn6hgca1T7cNZXpiq4q395ljbEI_
    1. https://www.youtube.com/watch?v=eED4bSkYCB8
    1. https://brm.io/game-physics-for-beginners/
    1. https://www.toptal.com/game/video-game-physics-part-ii-collision-detection-for-solid-objects
    1. SAT
        1. https://github.com/xSnapi/SAT-Collision
1. Physics
    1. https://www.youtube.com/watch?v=3lBYVSplAuo
    1. RigidBody
        1. https://rapier.rs/docs/user_guides/rust/rigid_bodies
1. Engine
    1. https://developer.ibm.com/tutorials/wa-build2dphysicsengine/


# Questions

1. Units (https://rapier.rs/docs/user_guides/rust/common_mistakes#why-is-everything-moving-in-slow-motion)
1. Depth Sorting
1. Add Scene (world of one of the stages) to Game (like for multiple levels)
1. ...

## Problems

1. Optimization
    1. Если мне приходится каждый раз перерасчитывать все с 0, то я буду тратить
    кучу ресурсов на это.
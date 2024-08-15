# TODO

1. Ray cast
1. Shape casting
    1. Rectangle
    1. Circle
    1. Capsule
1. Character Controller
1. Moving platforms
1. Separate tECS runtime types from schema
1. ...

# Roadmap

1. View
    1. ~~On entity kill destroy pView~~
    1. Polygon
    1. Capsule
    1. View -> ViewSet
    1. Scale
1. Collision
    1. Ray & Shape casting (https://rapier.rs/docs/user_guides/rust/scene_queries/)
    1. Bounding Box
    1. Colliders Index (all collider bodies, by types, collisions pairs, etc.)
    1. Scale
    1. Borrow phase (BVH)
    1. CCD
    1. Layers
    1. Multiple iterations per one cycle
    1. Fix Circle anchor
    1. Separate concave to convex
1. Character controller
    1. ~~Is grounded~~
    1. Move and slide
1. Physics
    1. Angle + Angular velocity
    1. Joints
    1. Apply gravity without friction
    1. Air friction
1. ...
1. Preload assets
1. Culling
1. ...
1. Top-down Tilemap
1. ...
1. Tweens
1. ...
1. Particles
1. ...

# Features

1. Game loop
1. Camera (zoom, pan, world bounds, move)
1. Pixi renderer
1. Tilemap (isometric)
1. Animations
1. Debug
1. Input (keyboard, mouse)
1. Physics
    1. RigidBody (static, dynamic, kinematic)
    1. Gravity
    1. Friction
    1. Force & Impulse
    1. Collision Response
1. Collision
    1. Circles, Rectangles, Polygon and Convex Vertices
    1. Compound
    1. Narrow Collision Check (on SAT + Awakened)
    1. Ray casting
    1. Collision Resolution
1. Events Monitoring
1. Character Controller
    1. Grounded
    1. Stop at obstacles
    1. Move and Slide
        1. Stairs
        1. ...

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
    1. https://www.youtube.com/@simondev758
1. Ray casting
    1. https://sszczep.dev/blog/ray-casting-in-2d-game-engines
    1. http://www.philliplemons.com/posts/ray-casting-algorithm
    1. https://medium.com/@girishajmera/exploring-algorithms-to-determine-points-inside-or-outside-a-polygon-038952946f87#:~:text=Ray%2DCasting%20Algorithm,the%20edges%20of%20the%20polygon.
1. Light and shadows
    1. https://www.redblobgames.com/articles/visibility/
    2. https://ncase.me/sight-and-light/
    3. https://www.youtube.com/watch?v=TOEi6T2mtHo
1. Isometric
    1. Rendering isometric map (https://melmouk.medium.com/algorithm-to-render-isometric-maps-3d86d1a49713)
    1. Cartesian to Iso
        1. https://codepen.io/StefanH/pen/qBgVPaQ
        1. https://gist.github.com/jordwest/8a12196436ebcf8df98a2745251915b5
        1. https://www.youtube.com/watch?v=04oQ2jOUjkU
1. Math
    1. Dot product – https://www.youtube.com/watch?v=LyGKycYT2v0

## Shape Casting

Problem: 
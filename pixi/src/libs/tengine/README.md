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

# Roadmap

1. Collision
1. Depth Sorting
1. Add collider
1. ...
1. Preload assets
1. Culling
1. ...
1. Top-down Tilemap
1. ...
1. Tweens
1. ...
1. ? Convert scale from float to int

# Caution

1. It's better not to change Camera size directly, use zoom for this
1. ...

# Useful links

1. Rendering isometric map (https://melmouk.medium.com/algorithm-to-render-isometric-maps-3d86d1a49713)
1. Cartesian to Iso
    1. https://codepen.io/StefanH/pen/qBgVPaQ
    1. https://gist.github.com/jordwest/8a12196436ebcf8df98a2745251915b5
    1. https://www.youtube.com/watch?v=04oQ2jOUjkU

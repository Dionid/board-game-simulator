# Features

1. Camera (move, boundaries, zoom)
1. Tilemap
1. Animations
1. ...

# Roadmap

1. ~~Camera~~
    1. ~~Camera movement~~
    1. ~~Scene boundaries~~
    1. ~~Camera zoom (~~scale~~, ~~position scale~~, ~~ease~~, move camera by boundaries, zoom from center)~~
1. ~~Tilemap~~
    1. ~~Draw map~~
    1. ~~Make it isometric~~
    1. ~~Separate to layers~~
1. ~~Add player~~
1. ~~Player animation~~
1. ~~Move player by clicking~~
1. Depth sorting
1. Move speed (Velocity) + correct animation
1. Debug
1. Add collider
1. ...
1. Preload assets
1. Culling
1. ...
1. ? Does requestAnimationFrame correct way
1. ...
1. Tweens
1. ...
1. ? Convert scale from float to int

# Useful links

1. Rendering isometric map (https://melmouk.medium.com/algorithm-to-render-isometric-maps-3d86d1a49713)
1. Cartesian to Iso
    1. https://codepen.io/StefanH/pen/qBgVPaQ
    1. https://gist.github.com/jordwest/8a12196436ebcf8df98a2745251915b5
    1. https://www.youtube.com/watch?v=04oQ2jOUjkU

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


# How Camera size must work

I want to have option to set Camera size and World must be scaled to fit Camera size
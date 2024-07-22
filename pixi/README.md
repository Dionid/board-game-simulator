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

# Game, Camera, Scene, Application, Map

1. Application contains backgroundColor, resizeTo -> It is our main canvas
1. Map contains all game elements (position and depth sorting)
1. In Game there can be a lot of Maps
1. Camera is virtual
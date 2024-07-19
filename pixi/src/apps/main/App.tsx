import { useEffect } from 'react';
import './App.css';
import { Application, Assets, Container, Sprite } from 'pixi.js';
import { initWorld } from './core';
import { step } from '../../libs/tecs';

function App() {
  useEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const app = new Application();
    app.init({ resizeTo: window, backgroundColor: 'white', autoStart: false }).then(async () => {

      const arrowTexture = await Assets.load("/assets/arrow_E.png");

      console.log("arrowTexture", arrowTexture)

      const worldContainer = new Container({
          // this will make moving this container GPU powered
          isRenderGroup: true,
      });

    const worldSize = 5000;

      for (let i = 0; i < 1000; i++) {
          const tree = new Sprite({
              texture: arrowTexture,
              x: Math.random() * worldSize,
              y: Math.random() * worldSize,
              scale: 0.25,
              anchor: 0.5,
          });
  
          worldContainer.addChild(tree);
      }

      // sort the trees by their y position
      worldContainer.children.sort((a, b) => a.position.y - b.position.y);

      app.stage.addChild(worldContainer);

      let x = 0;
      let y = 0;

      app.canvas.addEventListener('mousemove', (e) =>
      {
          x = e.clientX;
          y = e.clientY;
      });

      canvas.appendChild(app.canvas);
      const world = initWorld(app)
      const animation = () => {
        const screenWidth = app.renderer.width;
        const screenHeight = app.renderer.height;

        const targetX = (x / screenWidth) * (worldSize - screenWidth);
        const targetY = (y / screenHeight) * (worldSize - screenHeight);

        worldContainer.x += (-targetX - worldContainer.x) * 0.1;
        worldContainer.y += (-targetY - worldContainer.y) * 0.1;

        step(world)
        requestAnimationFrame(animation);
      }
      animation()
    })
  }, [])

  return (
    <div className="App">
      <div id="canvas"></div>
    </div>
  );
}

export default App;

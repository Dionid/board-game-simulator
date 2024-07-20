import { useEffect } from 'react';
import './App.css';
import { Application, Assets, Container, Sprite, Texture } from 'pixi.js';
import { initWorld } from './core';
import { step } from '../../libs/tecs';

function App() {
  useEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const app = new Application();
    app.init({ resizeTo: window, backgroundColor: 'white', autoStart: false }).then(async () => {
      canvas.appendChild(app.canvas);
      const world = await initWorld(app)
      const animation = () => {
        // const screenWidth = app.renderer.width;
        // const screenHeight = app.renderer.height;

        // const targetX = (x / screenWidth) * (worldSize - screenWidth);
        // const targetY = (y / screenHeight) * (worldSize - screenHeight);

        // worldContainer.x += (-targetX - worldContainer.x) * 0.1;
        // worldContainer.y += (-targetY - worldContainer.y) * 0.1;

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

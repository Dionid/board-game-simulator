import { useEffect } from 'react';
import './App.css';
import { Application, Assets, Container, Sprite, Texture } from 'pixi.js';
import { initWorld } from './game';
import { step } from '../../libs/tecs';

function App() {
  useEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const app = new Application();
    (globalThis as any).__PIXI_APP__ = app;
    app.init({ resizeTo: window, backgroundColor: 'white', autoStart: false }).then(async () => {
      canvas.appendChild(app.canvas);
      const world = await initWorld(app)
      const animation = () => {
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

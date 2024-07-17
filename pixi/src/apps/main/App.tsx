import { useEffect } from 'react';
import './App.css';
import { Application } from 'pixi.js';
import { initWorld } from './core';
import { step } from '../../libs/tecs';

const app = new Application();
await app.init({ resizeTo: window, backgroundColor: 'white' })

function App() {
  useEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.appendChild(app.canvas);
    const world = initWorld(app)
    const animation = () => {
      step(world)
      requestAnimationFrame(animation);
    }
    animation()

    // step(world)
  }, [])

  return (
    <div className="App">
      <div id="canvas"></div>
    </div>
  );
}

export default App;

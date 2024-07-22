import { useEffect } from 'react';
import './App.css';
import { Application } from 'pixi.js';
import { initWorld } from './game';
import { run } from '../../libs/tecs';

function App() {
  useEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const app = new Application();
    (globalThis as any).__PIXI_APP__ = app;
    app.init({ resizeTo: window, backgroundColor: 'white', autoStart: false }).then(async () => {
      canvas.appendChild(app.canvas);
      const world = await initWorld(app)
      run(world)
    })
  }, [])

  return (
    <div className="App">
      <div id="canvas"></div>
    </div>
  );
}

export default App;

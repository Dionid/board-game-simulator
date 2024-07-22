import { useEffect } from 'react';
import './App.css';
import { Application } from 'pixi.js';
import { initWorld } from './game';
import { run } from '../../libs/tengine/game';
import { initPongGame } from './pong';

function App() {
  useEffect(() => {
    const gameHolder = document.getElementById('gameHolder') as HTMLCanvasElement;
    
    // # PsyOps
    // const app = new Application();
    // (globalThis as any).__PIXI_APP__ = app;
    // app.init({ resizeTo: window, backgroundColor: 'white', autoStart: false }).then(async () => {
    //   canvas.appendChild(app.canvas);
    //   const world = await initWorld(app)
    //   run(world)
    // })

    // # Pong
    initPongGame(gameHolder).then((game) => {
      run(game)
    })
  }, [])

  return (
    <div className="App">
      <div id="gameHolder"></div>
    </div>
  );
}

export default App;

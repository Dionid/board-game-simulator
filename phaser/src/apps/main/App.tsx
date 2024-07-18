import { useEffect } from 'react';
import './App.css';
import { initWorld, MainScene } from './core';
import { step } from '../../libs/tecs';
import Phaser from 'phaser';

function App() {
  useEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    var config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: "100%",
      height: "100%",
      // width: window.innerWidth,
      // height: window.innerHeight,
      parent: canvas,
      scene: MainScene,
      physics: {
          default: 'matter',
          matter: {
              debug: true,
          }
      },
      scale: {
        mode: Phaser.Scale.NONE,
        width: window.innerWidth / 0.5,
        height: window.innerHeight / 0.5,
        zoom: 0.5,
        // zoom: 0.3,
        // mode: Phaser.Scale.ScaleModes.FIT,
      },
    };  
  
    const game = new Phaser.Game(config);
    // const app = new Application();
    // app.init({ resizeTo: window, backgroundColor: 'white', autoStart: false }).then(() => {
    //   canvas.appendChild(app.canvas);
    //   const world = initWorld(app)
    //   const animation = () => {
    //     step(world)
    //     requestAnimationFrame(animation);
    //   }
    //   animation()
    // })
  }, [])

  return (
    <div className="App">
      <div id="canvas"></div>
    </div>
  );
}

export default App;

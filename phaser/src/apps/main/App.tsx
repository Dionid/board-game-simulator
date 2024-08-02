import { useEffect } from 'react';
import './App.css';
import { initWorld, MainScene } from './core';
import { step } from '../../libs/tecs';
import Phaser from 'phaser';
import PhaserNavMeshPlugin from '../../libs/phaser-navmesh';

function App() {
  useEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    var config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 500,
      height: 500,
      parent: canvas,
      scene: MainScene,
      plugins: {
        scene: [
          {
            key: "PhaserNavMeshPlugin", // Key to store the plugin class under in cache
            plugin: PhaserNavMeshPlugin, // Class that constructs plugins
            mapping: "navMeshPlugin", // Property mapping to use for the scene, e.g. this.navMeshPlugin
            start: true
          }
        ]
      },
      physics: {
          default: 'matter',
          matter: {
              debug: true,
              gravity: {
                x: 0,
                y: 0,
              },
          }
      },
      scale: {
        mode: Phaser.Scale.NONE,
        // width: window.innerWidth / 0.5,
        // height: window.innerHeight / 0.5,
        zoom: 0.5,
      },
    };  
  
    const game = new Phaser.Game(config);

    (globalThis as any).__PHASER_GAME__ = game;
  }, [])

  return (
    <div className="App">
      <div id="canvas"></div>
    </div>
  );
}

export default App;

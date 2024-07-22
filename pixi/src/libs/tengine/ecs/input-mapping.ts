import { Container } from 'pixi.js';
import { System } from '../../tecs';
import { Game } from '../core';

export function mapMouseInput(worldScene: Game, mapContainer: Container): System {
  const input = worldScene.input;
  const mouse = input.mouse;
  const canvas = worldScene.app.canvas;
  const camera = worldScene.cameras.main;

  let mouseUp = false;
  let mouseDown = false;
  let mouseMoveEvent: MouseEvent | null = null;

  canvas.addEventListener('mousedown', (e) => {
    mouseDown = true;
  });

  canvas.addEventListener('mouseup', (e) => {
    mouseUp = true;
  });

  // # Mouse move
  canvas.addEventListener('mousemove', (e) => {
    mouseMoveEvent = e;
  });

  return () => {
    if (mouseDown) {
      mouse.previous.down = mouse.down;
      mouse.previous.up = mouse.up;

      mouse.down = true;
      mouse.up = false;

      mouseDown = false;
    }

    if (mouseUp) {
      mouse.previous.down = mouse.down;
      mouse.previous.up = mouse.up;

      mouse.down = false;
      mouse.up = true;

      mouseUp = false;
    }

    if (mouseMoveEvent) {
      mouse.previous.clientPosition.x = mouse.clientPosition.x;
      mouse.previous.clientPosition.y = mouse.clientPosition.y;
      mouse.previous.scenePosition.x = mouse.scenePosition.x;
      mouse.previous.scenePosition.y = mouse.scenePosition.y;
      mouse.previous.delta.clientPosition.x = mouse.delta.clientPosition.x;
      mouse.previous.delta.clientPosition.y = mouse.delta.clientPosition.y;

      mouse.clientPosition.x = mouseMoveEvent.x;
      mouse.clientPosition.y = mouseMoveEvent.y;

      mouse.delta.clientPosition.x = mouseMoveEvent.x - mouse.previous.clientPosition.x;
      mouse.delta.clientPosition.y = mouseMoveEvent.y - mouse.previous.clientPosition.y;

      mouse.scenePosition.x = Math.floor(mouseMoveEvent.x / camera.scale + camera.scaled.position.x);
      mouse.scenePosition.y = Math.floor(mouseMoveEvent.y / camera.scale + camera.scaled.position.y);

      mouse.delta.scenePosition.x = mouse.scenePosition.x - mouse.previous.scenePosition.x;
      mouse.delta.scenePosition.y = mouse.scenePosition.y - mouse.previous.scenePosition.y;

      mouse.mapPosition.x = mouse.scenePosition.x - mapContainer.x + mapContainer.pivot.x;
      mouse.mapPosition.y = mouse.scenePosition.y - mapContainer.y + mapContainer.pivot.y;

      mouseMoveEvent = null;
    }
  };
}

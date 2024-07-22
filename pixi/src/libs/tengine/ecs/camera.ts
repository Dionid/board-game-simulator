import { System } from '../../tecs';
import { Game } from '../core';

export function moveCamera(worldScene: Game): System {
  const camera = worldScene.cameras.main;

  const movementEase = 1;

  return () => {
    const newCameraX = camera.target.position.x;
    const newCameraY = camera.target.position.y;

    if (newCameraX === camera.position.x && newCameraY === camera.position.y) {
      return;
    }

    // # Calculate steps
    let stepX = (newCameraX - camera.position.x) * movementEase;
    let stepY = (newCameraY - camera.position.y) * movementEase;

    // # Apply step threshold
    if (Math.abs(stepX) < 0.0001) {
      stepX = newCameraX - camera.position.x;
    }

    if (Math.abs(stepY) < 0.0001) {
      stepY = newCameraY - camera.position.y;
    }

    camera.position.x += stepX;
    camera.position.y += stepY;
    camera.scaled.position.x = camera.position.x / camera.scale;
    camera.scaled.position.y = camera.position.y / camera.scale;
  };
}

export const zoom = (worldScene: Game): System => {
  const camera = worldScene.cameras.main;

  let scaleEvent: KeyboardEvent | null = null;

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') {
      return;
    }

    scaleEvent = e;
  });

  const calculateScale = (scaleEvent: KeyboardEvent) => {
    const delta = scaleEvent.key === 'ArrowUp' ? 0.1 : -0.1;

    const currentScale = camera.scale;
    let newScale = parseFloat((currentScale + delta).toFixed(1));

    if (newScale < 0.5) {
      return currentScale;
    } else if (newScale > 2) {
      return currentScale;
    } else if (camera.size.width / newScale > worldScene.size.width) {
      return currentScale;
    } else if (camera.size.height / newScale > worldScene.size.height) {
      return currentScale;
    }

    return newScale;
  };

  return ({ world, deltaFrameTime }) => {
    if (scaleEvent !== null) {
      const newScale = calculateScale(scaleEvent);
      camera.target.scale = newScale;
      scaleEvent = null;
    }

    const newScale = camera.target.scale;

    if (camera.scale === newScale) {
      return;
    }

    // # Calculate step
    let step = (newScale - camera.scale) * 0.3;

    // # Apply step threshold
    if (Math.abs(step) < 0.0001) {
      step = newScale - camera.scale;
    }

    camera.scale += step;
    camera.scaled.position.x = camera.position.x / camera.scale;
    camera.scaled.position.y = camera.position.y / camera.scale;
    camera.scaled.size.width = camera.size.width / camera.scale;
    camera.scaled.size.height = camera.size.height / camera.scale;
  };
};

export function applyWorldBoundariesToCamera(worldScene: Game): System {
  const camera = worldScene.cameras.main;

  return () => {
    // # Calculate new camera
    let newCameraX = camera.target.position.x;
    let newCameraY = camera.target.position.y;

    if (newCameraX === camera.scaled.position.x && newCameraY === camera.scaled.position.y) {
      return;
    }

    if (newCameraX < 0) {
      newCameraX = 0;
    } else if (newCameraX / camera.scale > worldScene.size.width - camera.scaled.size.width) {
      newCameraX = (worldScene.size.width - camera.scaled.size.width) * camera.scale;
    }

    if (newCameraY < 0) {
      newCameraY = 0;
    } else if (newCameraY / camera.scale > worldScene.size.height - camera.scaled.size.height) {
      newCameraY = (worldScene.size.height - camera.scaled.size.height) * camera.scale;
    }

    camera.target.position.x = newCameraX;
    camera.target.position.y = newCameraY;
  };
}

export function moveCameraByDragging(worldScene: Game): System {
  const camera = worldScene.cameras.main;
  const mouse = worldScene.input.mouse;

  const cameraSpeed = 1;

  return () => {
    // # Calculate new camera
    if (mouse.down) {
      let newCameraX = camera.position.x - mouse.delta.clientPosition.x * cameraSpeed;
      let newCameraY = camera.position.y - mouse.delta.clientPosition.y * cameraSpeed;

      camera.target.position.x = newCameraX;
      camera.target.position.y = newCameraY;
    }
  };
}

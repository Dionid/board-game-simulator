import { System } from '../../tecs';
import { Game } from '../game';

export function moveCamera(worldScene: Game): System {
  const camera = worldScene.camera.main;

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
    camera.scaled.position.x = camera.position.x / camera.scale.x;
    camera.scaled.position.y = camera.position.y / camera.scale.y;
  };
}

export const zoom = (game: Game): System => {
  const camera = game.camera.main;
  const { zoom, scale } = camera;

  let scaleEvent: KeyboardEvent | null = null;

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') {
      return;
    }

    scaleEvent = e;
  });

  const calculateScale = (scaleEvent: KeyboardEvent) => {
    const delta = scaleEvent.key === 'ArrowUp' ? zoom.step : -zoom.step;

    let newScale = {
      x: camera.target.scale.x + delta,
      y: camera.target.scale.y + delta,
    };

    if (newScale.x < zoom.min || newScale.y < zoom.min) {
      return scale;
    } else if (newScale.x > zoom.max || newScale.y > zoom.max) {
      return scale;
    } else if (camera.size.width / newScale.x > game.world.size.width) {
      return scale;
    } else if (camera.size.height / newScale.y > game.world.size.height) {
      return scale;
    }

    return newScale;
  };

  return () => {
    // # Set camera target scale
    if (scaleEvent !== null) {
      const newScale = calculateScale(scaleEvent);
      camera.target.scale = newScale;
      scaleEvent = null;
    }

    // # Animate camera scaling
    const targetScale = camera.target.scale;

    if (camera.scale === targetScale) {
      return;
    }

    // # Calculate step
    let stepX = (targetScale.x - camera.scale.x) * 0.3;
    let stepY = (targetScale.x - camera.scale.x) * 0.3;

    // # Apply step threshold
    if (Math.abs(stepX) < 0.0001) {
      stepX = targetScale.x - camera.scale.x;
    }

    if (Math.abs(stepX) < 0.0001) {
      stepY = targetScale.y - camera.scale.y;
    }

    camera.scale.x += stepX;
    camera.scale.y += stepY;

    camera.scaled.position.x = camera.position.x / camera.scale.x;
    camera.scaled.position.y = camera.position.y / camera.scale.y;

    camera.scaled.size.width = camera.size.width / camera.scale.x;
    camera.scaled.size.height = camera.size.height / camera.scale.y;
  };
};

export function applyWorldBoundariesToCamera(game: Game): System {
  const camera = game.camera.main;

  return () => {
    // # Calculate new camera
    let newCameraX = camera.target.position.x;
    let newCameraY = camera.target.position.y;

    if (newCameraX === camera.scaled.position.x && newCameraY === camera.scaled.position.y) {
      return;
    }

    if (newCameraX < 0) {
      newCameraX = 0;
    } else if (newCameraX / camera.scale.x > game.world.size.width - camera.scaled.size.width) {
      newCameraX = (game.world.size.width - camera.scaled.size.width) * camera.scale.x;
    }

    if (newCameraY < 0) {
      newCameraY = 0;
    } else if (newCameraY / camera.scale.y > game.world.size.height - camera.scaled.size.height) {
      newCameraY = (game.world.size.height - camera.scaled.size.height) * camera.scale.y;
    }

    camera.target.position.x = newCameraX;
    camera.target.position.y = newCameraY;
  };
}

export function moveCameraByDragging(worldScene: Game): System {
  const camera = worldScene.camera.main;
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

import { Size, Vector2 } from './types';

export type Camera = {
  position: Vector2;
  size: Size;
  scale: number;
  scaled: {
    position: Vector2;
    size: Size;
  };
  target: {
    position: Vector2;
    scale: number;
  };
};

export type NewCameraProps = {
  position?: Vector2;
  size?: Partial<Size>;
  scale?: number;
};

export function newCamera(props: NewCameraProps = {}): Camera {
  const scale = props.scale ?? 1;

  const position = {
    x: props.position?.x ?? 0,
    y: props.position?.y ?? 0,
  };

  const size = {
    width: props.size?.width ?? 0,
    height: props.size?.height ?? 0,
  };

  return {
    position: {
      x: position.x,
      y: position.y,
    },
    size: {
      width: size.width,
      height: size.height,
    },
    scale,
    scaled: {
      position: {
        x: position.x / scale,
        y: position.y / scale,
      },
      size: {
        width: size.width / scale,
        height: size.height / scale,
      },
    },
    target: {
      position: {
        x: position.x,
        y: position.y,
      },
      scale,
    },
  };
}

export function setCameraPosition(camera: Camera, x: number, y: number) {
  camera.position.x = x;
  camera.position.y = y;

  camera.target.position.x = x;
  camera.target.position.y = y;

  camera.scaled.position.x = x / camera.scale;
  camera.scaled.position.y = y / camera.scale;
}

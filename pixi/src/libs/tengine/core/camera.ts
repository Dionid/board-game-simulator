import { MinMax, Size, Vector2 } from './types';

export type CameraScale = Vector2;

export type CameraZoom = MinMax & {
  step: number;
};

export type Camera = {
  position: Vector2;
  size: Size;
  scale: CameraScale;
  scaled: {
    position: Vector2;
    size: Size;
  };
  zoom: CameraZoom;
  target: {
    position: Vector2;
    scale: Vector2;
  };
};

export type NewCameraProps = {
  position?: Vector2;
  size?: Partial<Size>;
  scale?: Partial<CameraScale>;
  zoom?: Partial<CameraZoom>;
};

export function newCamera(props: NewCameraProps = {}): Camera {
  const position = {
    x: props.position?.x ?? 0,
    y: props.position?.y ?? 0,
  };

  const size = {
    width: props.size?.width ?? 0,
    height: props.size?.height ?? 0,
  };

  const scale = {
    x: props.scale?.x ?? 1,
    y: props.scale?.y ?? 1,
  };

  const zoom = {
    min: props.zoom?.min ?? 0.5,
    max: props.zoom?.max ?? 2,
    step: props.zoom?.step ?? 0.1,
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
    zoom,
    scale,
    scaled: {
      position: {
        x: position.x / scale.x,
        y: position.y / scale.y,
      },
      size: {
        width: size.width / scale.x,
        height: size.height / scale.y,
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

  camera.scaled.position.x = x / camera.scale.x;
  camera.scaled.position.y = y / camera.scale.y;
}

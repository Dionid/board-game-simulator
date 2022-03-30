export type Vector2 = {
  x: number;
  y: number;
};

export const Vector2 = {
  sum: (a: Vector2, b: Vector2): Vector2 => {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
    };
  },
};

export type Vector3 = {
  x: number;
  y: number;
  z: number;
};

export type Size = {
  width: number;
  height: number;
};

export type Square = Vector2 & Size;

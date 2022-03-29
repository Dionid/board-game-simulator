export type Vector2 = {
  x: number;
  y: number;
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

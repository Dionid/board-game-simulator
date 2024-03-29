export type Vector2 = {
  x: number;
  y: number;
};

export const Vector2 = {
  multiply: (a: Vector2, b: Vector2): Vector2 => {
    return {
      x: a.x * b.x,
      y: a.y * b.y,
    };
  },
  divide: (a: Vector2, b: Vector2): Vector2 => {
    return {
      x: a.x / b.x,
      y: a.y / b.y,
    };
  },
  sum: (a: Vector2, b: Vector2): Vector2 => {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
    };
  },
  subtract: (a: Vector2, b: Vector2): Vector2 => {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
    };
  },
  minMaxDelta: (a: Vector2, b: Vector2): Vector2 => {
    return {
      x: Math.max(a.x, b.x) - Math.min(a.x, b.x),
      y: Math.max(a.y, b.y) - Math.min(a.y, b.y),
    };
  },
  compareAndChange: (previous: Vector2, current: Vector2): Vector2 => {
    const res: Vector2 = {
      x: 0,
      y: 0,
    };
    if (previous.x > current.x) {
      res.x -= previous.x - current.x;
    } else {
      res.x += current.x - previous.x;
    }
    if (previous.y > current.y) {
      res.y -= previous.y - current.y;
    } else {
      res.y += current.y - previous.y;
    }
    return res;
  },
};

export type Vector3 = {
  x: number;
  y: number;
  z: number;
};

export const Vector3 = {
  sum: (a: Vector3, b: Vector3): Vector3 => {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
      z: a.z + b.z,
    };
  },
  minMaxDelta: (a: Vector3, b: Vector3): Vector3 => {
    return {
      x: Math.max(a.x, b.x) - Math.min(a.x, b.x),
      y: Math.max(a.y, b.y) - Math.min(a.y, b.y),
      z: Math.max(a.z, b.z) - Math.min(a.z, b.z),
    };
  },
};

export type Size = {
  width: number;
  height: number;
};

export const Size = {
  multiplyByVector2: (size: Size, vector: Vector2): Size => {
    return {
      width: size.width * vector.x,
      height: size.height * vector.y,
    };
  },
};

export type Square = Vector2 & Size;

export const Square = {
  isInside: (square: Square, position: Vector2): boolean => {
    return (
      position.x > square.x &&
      position.x < square.x + square.width &&
      position.y > square.y &&
      position.y < square.y + square.height
    );
  },
};

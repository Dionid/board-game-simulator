export const Vector2 = {
  multiply: (a, b) => {
    return {
      x: a.x * b.x,
      y: a.y * b.y,
    };
  },
  divide: (a, b) => {
    return {
      x: a.x / b.x,
      y: a.y / b.y,
    };
  },
  sum: (a, b) => {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
    };
  },
  subtract: (a, b) => {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
    };
  },
  minMaxDelta: (a, b) => {
    return {
      x: Math.max(a.x, b.x) - Math.min(a.x, b.x),
      y: Math.max(a.y, b.y) - Math.min(a.y, b.y),
    };
  },
  compareAndChange: (previous, current) => {
    const res = {
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
export const Vector3 = {
  sum: (a, b) => {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
      z: a.z + b.z,
    };
  },
  minMaxDelta: (a, b) => {
    return {
      x: Math.max(a.x, b.x) - Math.min(a.x, b.x),
      y: Math.max(a.y, b.y) - Math.min(a.y, b.y),
      z: Math.max(a.z, b.z) - Math.min(a.z, b.z),
    };
  },
};
export const Size = {
  multiplyByVector2: (size, vector) => {
    return {
      width: size.width * vector.x,
      height: size.height * vector.y,
    };
  },
};
export const Square = {
  isInside: (square, position) => {
    return (
      position.x > square.x &&
      position.x < square.x + square.width &&
      position.y > square.y &&
      position.y < square.y + square.height
    );
  },
};

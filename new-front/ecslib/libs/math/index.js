export var Vector2 = {
  multiply: function (a, b) {
    return {
      x: a.x * b.x,
      y: a.y * b.y,
    };
  },
  divide: function (a, b) {
    return {
      x: a.x / b.x,
      y: a.y / b.y,
    };
  },
  sum: function (a, b) {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
    };
  },
  subtract: function (a, b) {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
    };
  },
  minMaxDelta: function (a, b) {
    return {
      x: Math.max(a.x, b.x) - Math.min(a.x, b.x),
      y: Math.max(a.y, b.y) - Math.min(a.y, b.y),
    };
  },
  compareAndChange: function (previous, current) {
    var res = {
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
export var Vector3 = {
  sum: function (a, b) {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
      z: a.z + b.z,
    };
  },
  minMaxDelta: function (a, b) {
    return {
      x: Math.max(a.x, b.x) - Math.min(a.x, b.x),
      y: Math.max(a.y, b.y) - Math.min(a.y, b.y),
      z: Math.max(a.z, b.z) - Math.min(a.z, b.z),
    };
  },
};
export var Size = {
  multiplyByVector2: function (size, vector) {
    return {
      width: size.width * vector.x,
      height: size.height * vector.y,
    };
  },
};
export var Square = {
  isInside: function (square, position) {
    return (
      position.x > square.x &&
      position.x < square.x + square.width &&
      position.y > square.y &&
      position.y < square.y + square.height
    );
  },
};

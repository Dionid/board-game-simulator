import { newSchema, arrayOf, union, literal, number, newTag, Component } from '../../tecs';
import {
  Axes2,
  dotV2,
  magV2,
  mutRotateV2Around,
  mutRotateVertices2Around,
  normalAxes2,
  normalV2,
  round,
  subV2,
  unitV2,
  Vector2,
  Vertex2,
  Vertices2,
} from '../core';

// # Check this object for collisions with any other Colliders
export const CollisionsMonitoring = newTag('CollisionsMonitoring');

// # Forbid penetration of solid Colliders
export const Impenetrable = newTag('Impenetrable');

// # Awaken
export const Awaken = newTag('Awaken');

// # Collider
export const ColliderCircle = newSchema({
  type: literal('circle'),
  radius: number,
  anchor: Vector2,
});

export const ColliderVertices = newSchema({
  type: literal('vertices'),
  anchor: Vector2,
});

export const ColliderShape = union(ColliderCircle, ColliderVertices);

export const Collider = newSchema(
  {
    type: union(literal('solid'), literal('sensor')),
    offset: Vector2,
    angle: number,
    shape: ColliderShape,
    mass: number,
    _position: Vector2, // position of colliders center
    _vertices: Vertices2,
    _normalAxes: Axes2,
    _prev: newSchema({
      angle: number,
      offset: Vector2,
    }),
  },
  {
    name: 'Collider',
  }
);

export function rectangleColliderComponent(opts: {
  parentPosition: Vector2; // TODO: remove this
  parentAngle?: number; // TODO: remove this
  type: 'solid' | 'sensor';
  mass?: number;
  offset?: Vector2;
  angle?: number;
  anchor?: Vector2;
  size: { width: number; height: number };
}): Component<typeof Collider> {
  const offset = opts.offset || { x: 0, y: 0 };
  const parentAngle = opts.parentAngle ?? 0;
  const anchor = opts.anchor || { x: 0.5, y: 0.5 };
  const angle = opts.angle || 0;
  const mass = opts.mass || 1;

  const origin = {
    x: opts.parentPosition.x + offset.x,
    y: opts.parentPosition.y + offset.y,
  };

  mutRotateV2Around(origin, parentAngle, opts.parentPosition);

  const verticesStartPosition = {
    x: origin.x - opts.size.width * anchor.x,
    y: origin.y - opts.size.height * anchor.y,
  };

  const colliderVertices = [
    {
      x: verticesStartPosition.x,
      y: verticesStartPosition.y,
    },
    {
      x: verticesStartPosition.x + opts.size.width,
      y: verticesStartPosition.y,
    },
    {
      x: verticesStartPosition.x + opts.size.width,
      y: verticesStartPosition.y + opts.size.height,
    },
    {
      x: verticesStartPosition.x,
      y: verticesStartPosition.y + opts.size.height,
    },
  ];

  mutRotateVertices2Around(colliderVertices, angle + parentAngle, origin);

  // # Rectangle can have only 2 normal axes
  const normalAxes = [
    normalV2(unitV2(subV2(colliderVertices[1], colliderVertices[0]))),
    normalV2(unitV2(subV2(colliderVertices[2], colliderVertices[1]))),
  ];

  const component = {
    type: opts.type,
    mass: mass,
    offset: offset,
    angle: angle,
    shape: {
      type: 'vertices' as const,
      anchor: anchor,
    },
    _position: origin,
    _vertices: colliderVertices,
    _normalAxes: normalAxes,
    _prev: {
      angle: angle,
      offset: {
        x: offset.x,
        y: offset.y,
      },
    },
  };

  return component;
}

export function rectangleColliderComponentSE(opts: {
  parentAngle?: number; // TODO: remove this
  type: 'solid' | 'sensor';
  mass: number;
  start: Vector2;
  end: Vector2;
  width: number;
  angle?: number;
  anchor?: Vector2;
}): Component<typeof Collider> {
  const offset = { x: 0, y: 0 };
  const parentAngle = opts.parentAngle ?? 0;
  const anchor = opts.anchor || { x: 0.5, y: 0.5 };
  let angle = opts.angle || 0;

  const { start, end, width } = opts;

  const height = magV2(subV2(end, start));

  const verticesStartPosition = {
    x: start.x - width * anchor.x,
    y: start.y - height * anchor.y,
  };

  const colliderVertices = [
    {
      x: verticesStartPosition.x,
      y: verticesStartPosition.y,
    },
    {
      x: verticesStartPosition.x + width,
      y: verticesStartPosition.y,
    },
    {
      x: verticesStartPosition.x + width,
      y: verticesStartPosition.y + height,
    },
    {
      x: verticesStartPosition.x,
      y: verticesStartPosition.y + height,
    },
  ];

  const dotProd = dotV2(
    {
      x: 0,
      y: height,
    },
    {
      x: end.x - start.x,
      y: end.y - start.y,
    }
  );

  const aMag = height;
  const bMag = magV2({
    x: end.x - start.x,
    y: end.y - start.y,
  });

  const cosTheta = dotProd / (aMag * bMag);

  const clampedCosTheta = Math.max(-1, Math.min(1, cosTheta));

  angle -= Math.acos(clampedCosTheta);

  mutRotateVertices2Around(colliderVertices, angle + parentAngle, start);

  // # Rectangle can have only 2 normal axes
  const normalAxes = [
    normalV2(unitV2(subV2(colliderVertices[1], colliderVertices[0]))),
    normalV2(unitV2(subV2(colliderVertices[2], colliderVertices[1]))),
  ];

  const component = {
    type: opts.type,
    mass: opts.mass,
    offset: offset,
    angle: angle,
    shape: {
      type: 'vertices' as const,
      anchor: anchor,
    },
    _position: start,
    _vertices: colliderVertices,
    _normalAxes: normalAxes,
    _prev: {
      angle: angle,
      offset: {
        x: offset.x,
        y: offset.y,
      },
    },
  };

  return component;
}

export function lineColliderComponent(opts: {
  parentPosition: Vector2; // TODO: remove this
  parentAngle: number; // TODO: remove this
  type: 'solid' | 'sensor';
  mass: number;
  offset: Vector2;
  angle: number;
  anchor: Vector2;
  length: number;
}): Component<typeof Collider> {
  const origin = {
    x: opts.parentPosition.x + opts.offset.x,
    y: opts.parentPosition.y + opts.offset.y,
  };

  // PROBLEM IS THAT ANGLE DOESN'T APPLY HERE
  const verticesStartPosition = {
    x: origin.x - opts.length * opts.anchor.x,
    y: origin.y - opts.length * opts.anchor.y,
  };

  const colliderVertices = [
    {
      x: verticesStartPosition.x,
      y: verticesStartPosition.y,
    },
    {
      x: verticesStartPosition.x,
      y: verticesStartPosition.y + opts.length,
    },
  ];

  mutRotateVertices2Around(colliderVertices, opts.angle, origin);
  mutRotateVertices2Around(colliderVertices, opts.parentAngle, opts.parentPosition);

  // # Rectangle can have only 2 normal axes
  const normalAxes = [normalV2(unitV2(subV2(colliderVertices[1], colliderVertices[0])))];

  const component = {
    type: opts.type,
    mass: opts.mass,
    offset: opts.offset,
    angle: opts.angle,
    shape: {
      type: 'vertices' as const,
      anchor: opts.anchor,
    },
    _position: origin,
    _vertices: colliderVertices,
    _normalAxes: normalAxes,
    _prev: {
      angle: opts.angle,
      offset: {
        x: opts.offset.x,
        y: opts.offset.y,
      },
    },
  };

  return component;
}

export function isoscelesRightTriangleColliderComponent(opts: {
  parentPosition: Vector2; // TODO: remove this
  parentAngle: number; // TODO: remove this
  type: 'solid' | 'sensor';
  mass: number;
  offset: Vector2;
  angle: number;
  anchor: Vector2;
  length: number;
}): Component<typeof Collider> {
  const origin = {
    x: opts.parentPosition.x + opts.offset.x,
    y: opts.parentPosition.y + opts.offset.y,
  };

  const centroidX = opts.length / 3;
  const centroidY = opts.length / 3;

  const verticesStartPosition = {
    x: origin.x - 2 * centroidX * opts.anchor.x,
    y: origin.y + 2 * centroidY * opts.anchor.y,
  };

  const colliderVertices = [
    {
      x: verticesStartPosition.x,
      y: verticesStartPosition.y,
    },
    {
      x: verticesStartPosition.x,
      y: verticesStartPosition.y - opts.length,
    },
    {
      x: verticesStartPosition.x + opts.length,
      y: verticesStartPosition.y,
    },
  ];

  mutRotateVertices2Around(colliderVertices, opts.angle, origin);
  mutRotateVertices2Around(colliderVertices, opts.parentAngle, opts.parentPosition);

  // # Rectangle can have only 2 normal axes
  const normalAxes = normalAxes2(colliderVertices);

  const component = {
    type: opts.type,
    mass: opts.mass,
    offset: opts.offset,
    angle: opts.angle,
    shape: {
      type: 'vertices' as const,
      anchor: opts.anchor,
    },
    _position: origin,
    _vertices: colliderVertices,
    _normalAxes: normalAxes,
    _prev: {
      angle: opts.angle,
      offset: {
        x: opts.offset.x,
        y: opts.offset.y,
      },
    },
  };

  return component;
}

export function centroidTriangleColliderComponent(opts: {
  parentPosition: Vector2; // TODO: remove this
  parentAngle: number; // TODO: remove this
  type: 'solid' | 'sensor';
  mass: number;
  offset: Vector2;
  angle: number;
  anchor: Vector2;
  a: Vertex2;
  b: Vertex2;
  c: Vertex2;
}): Component<typeof Collider> {
  const { a, b, c } = opts;

  const origin = {
    x: opts.parentPosition.x + opts.offset.x,
    y: opts.parentPosition.y + opts.offset.y,
  };

  const centroidX = (a.x + b.x + c.x) / 3;
  const centroidY = (a.y + b.y + c.y) / 3;

  const verticesStartPosition = {
    x: origin.x - 2 * centroidX * opts.anchor.x,
    y: origin.y - 2 * centroidY * opts.anchor.y,
  };

  const vertices = [a, b, c];

  // # Apply verticesStartPosition to vertices
  for (let i = 0; i < vertices.length; i++) {
    vertices[i].x += verticesStartPosition.x;
    vertices[i].y += verticesStartPosition.y;
  }

  mutRotateVertices2Around(vertices, opts.angle, origin);
  mutRotateVertices2Around(vertices, opts.parentAngle, opts.parentPosition);

  const normalAxes = normalAxes2(vertices);

  const component = {
    type: opts.type,
    mass: opts.mass,
    offset: opts.offset,
    angle: opts.angle,
    shape: {
      type: 'vertices' as const,
      anchor: opts.anchor,
    },
    _position: origin,
    _vertices: vertices,
    _normalAxes: normalAxes,
    _prev: {
      angle: opts.angle,
      offset: {
        x: opts.offset.x,
        y: opts.offset.y,
      },
    },
  };

  return component;
}

export function verticesColliderComponent(opts: {
  parentPosition: Vector2; // TODO: remove this
  parentAngle?: number; // TODO: remove this
  type?: 'solid' | 'sensor';
  mass?: number;
  offset?: Vector2;
  angle?: number;
  anchor?: Vector2;
  vertices: Vertices2;
}): Component<typeof Collider> {
  const offset = opts.offset || { x: 0, y: 0 };
  const parentAngle = opts.parentAngle ?? 0;
  const anchor = opts.anchor || { x: 0.5, y: 0.5 };
  const angle = opts.angle || 0;
  const type = opts.type || 'solid';
  const mass = opts.mass || 1;

  const origin = {
    x: opts.parentPosition.x + offset.x,
    y: opts.parentPosition.y + offset.y,
  };

  // Get min and max x and y values of vertices
  let minX = opts.vertices[0].x;
  let minY = opts.vertices[0].x;
  let maxX = minX;
  let maxY = minY;

  for (let i = 1; i < opts.vertices.length; i++) {
    const vertex = opts.vertices[i];
    if (vertex.x < minX) {
      minX = vertex.x;
    } else if (vertex.x > maxX) {
      maxX = vertex.x;
    }

    if (vertex.y < minY) {
      minY = vertex.y;
    } else if (vertex.y > maxY) {
      maxY = vertex.y;
    }
  }

  const width = maxX - minX;
  const height = maxY - minY;

  const verticesStartPosition = {
    x: origin.x - width * anchor.x,
    y: origin.y - height * anchor.y,
  };

  // # Apply verticesStartPosition to vertices
  for (let i = 0; i < opts.vertices.length; i++) {
    opts.vertices[i].x += verticesStartPosition.x;
    opts.vertices[i].y += verticesStartPosition.y;
  }

  mutRotateVertices2Around(opts.vertices, angle, origin);
  mutRotateVertices2Around(opts.vertices, parentAngle, opts.parentPosition);

  const normalAxes = normalAxes2(opts.vertices);

  const component: Component<typeof Collider> = {
    type: type,
    mass: mass,
    offset: offset,
    angle: angle,
    shape: {
      type: 'vertices' as const,
      anchor: anchor,
    },
    _position: origin,
    _vertices: opts.vertices,
    _normalAxes: normalAxes,
    _prev: {
      angle: angle,
      offset: {
        x: offset.x,
        y: offset.y,
      },
    },
  };

  return component;
}

export function circleColliderComponent(opts: {
  parentPosition: Vector2; // TODO: remove this
  parentAngle: number;
  type: 'solid' | 'sensor';
  mass: number;
  offset: Vector2;
  anchor: Vector2;
  radius: number;
}): Component<typeof Collider> {
  const position = {
    x: opts.parentPosition.x + opts.offset.x,
    y: opts.parentPosition.y + opts.offset.y,
  };
  const colliderVertices: Axes2 = [];

  const normalAxes = normalAxes2(colliderVertices);

  mutRotateV2Around(position, opts.parentAngle, opts.parentPosition);

  return {
    type: opts.type,
    mass: opts.mass,
    offset: opts.offset,
    angle: 0,
    shape: {
      type: 'circle' as const,
      anchor: opts.anchor,
      radius: opts.radius,
    },
    _position: position,
    _vertices: colliderVertices,
    _normalAxes: normalAxes,
    _prev: {
      angle: 0,
      offset: {
        x: opts.offset.x,
        y: opts.offset.y,
      },
    },
  };
}

export function polygonColliderComponent(opts: {
  parentPosition: Vector2; // TODO: remove this
  parentAngle: number;
  type: 'solid' | 'sensor';
  mass: number;
  offset: Vector2;
  anchor: Vector2;
  radius: number;
  angle: number;
  sides: number;
}): Component<typeof Collider> {
  const { sides, radius, anchor } = opts;

  if (sides < 3) {
    return circleColliderComponent(opts);
  }

  const position = {
    x: opts.parentPosition.x + opts.offset.x,
    y: opts.parentPosition.y + opts.offset.y,
  };

  const verticesStaringPosition = {
    x: position.x + radius - 2 * radius * anchor.x,
    y: position.y + radius - 2 * radius * anchor.y,
  };

  const theta = (2 * Math.PI) / sides;

  const vertices: Axes2 = [];

  for (var i = 0; i < sides; i += 1) {
    const angle = i * theta;
    const xx = Math.cos(angle) * radius;
    const yy = Math.sin(angle) * radius;

    vertices.push({
      x: verticesStaringPosition.x + round(xx, 3),
      y: verticesStaringPosition.y + round(yy, 3),
    });
  }

  const normalAxes = normalAxes2(vertices);

  // mutRotateV2Around(position, opts.parentAngle, opts.parentPosition);

  return {
    type: opts.type,
    mass: opts.mass,
    offset: opts.offset,
    angle: 0,
    shape: {
      type: 'vertices' as const,
      anchor: opts.anchor,
    },
    _position: position,
    _vertices: vertices,
    _normalAxes: normalAxes,
    _prev: {
      angle: 0,
      offset: {
        x: opts.offset.x,
        y: opts.offset.y,
      },
    },
  };
}

export function capsuleColliderComponent(opts: {
  parentPosition: Vector2; // TODO: remove this
  parentAngle?: number; // TODO: remove this
  type?: 'solid' | 'sensor';
  mass?: number;
  offset?: Vector2;
  length: number;
  radius: number;
  angle?: number;
}): Component<typeof Collider>[] {
  const mass = (opts.mass ?? 1) / 3;
  const offset = opts.offset ?? { x: 0, y: 0 };
  const type = opts.type ?? 'solid';
  const parentAngle = opts.parentAngle ?? 0;
  const angle = opts.angle ?? 0;

  const rectangleSize = {
    width: opts.radius * 2,
    height: opts.length - opts.radius * 2,
  };

  const rectangle = rectangleColliderComponent({
    parentPosition: opts.parentPosition,
    parentAngle: opts.parentAngle,
    type,
    mass,
    offset,
    angle: opts.angle,
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    size: rectangleSize,
  });

  // # to make circles go a little deeper into rectangle
  const circleThreshold = 0.5;

  const firstCircle = circleColliderComponent({
    parentPosition: opts.parentPosition,
    type,
    parentAngle,
    mass,
    offset: { x: offset.x, y: offset.y - rectangleSize.height / 2 + circleThreshold },
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    radius: opts.radius,
  });

  const secondCircle = circleColliderComponent({
    parentPosition: opts.parentPosition,
    type,
    parentAngle,
    mass,
    offset: { x: offset.x, y: offset.y + rectangleSize.height / 2 - circleThreshold },
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    radius: opts.radius,
  });

  mutRotateV2Around(firstCircle._position, angle, rectangle._position);
  mutRotateV2Around(secondCircle._position, angle, rectangle._position);

  return [firstCircle, rectangle, secondCircle];
}

export const ColliderBody = newSchema(
  {
    parts: arrayOf(Collider),
  },
  {
    name: 'ColliderBody',
  }
);

import { newSchema, arrayOf, union, literal, number, newTag, Component } from '../../tecs';
import {
  Axes2,
  mutRotateV2Around,
  mutRotateVertices2Around,
  normalAxes2,
  normalV2,
  subV2,
  unitV2,
  Vector2,
  Vertex2,
  Vertices2,
} from '../core';

// # Check this object for collisions with any other Colliders
export const CollisionsMonitoring = newTag();

// # Forbid penetration of solid Colliders
export const Impenetrable = newTag();

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

export const Collider = newSchema({
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
});

export function rectangleColliderComponent(opts: {
  parentPosition: Vector2; // TODO: remove this
  parentAngle: number; // TODO: remove this
  type: 'solid' | 'sensor';
  mass: number;
  offset: Vector2;
  angle: number;
  anchor: Vector2;
  size: { width: number; height: number };
}): Component<typeof Collider> {
  const origin = {
    x: opts.parentPosition.x + opts.offset.x,
    y: opts.parentPosition.y + opts.offset.y,
  };

  mutRotateV2Around(origin, opts.parentAngle, opts.parentPosition);

  const verticesStartPosition = {
    x: origin.x - opts.size.width * opts.anchor.x,
    y: origin.y - opts.size.height * opts.anchor.y,
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

  mutRotateVertices2Around(colliderVertices, opts.angle + opts.parentAngle, origin);

  // # Rectangle can have only 2 normal axes
  const normalAxes = [
    normalV2(unitV2(subV2(colliderVertices[1], colliderVertices[0]))),
    normalV2(unitV2(subV2(colliderVertices[2], colliderVertices[1]))),
  ];

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
  parentAngle: number; // TODO: remove this
  type: 'solid' | 'sensor';
  mass: number;
  offset: Vector2;
  angle: number;
  anchor: Vector2;
  vertices: Vertices2;
}): Component<typeof Collider> {
  const origin = {
    x: opts.parentPosition.x + opts.offset.x,
    y: opts.parentPosition.y + opts.offset.y,
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
    x: origin.x - width * opts.anchor.x,
    y: origin.y - height * opts.anchor.y,
  };

  // # Apply verticesStartPosition to vertices
  for (let i = 0; i < opts.vertices.length; i++) {
    opts.vertices[i].x += verticesStartPosition.x;
    opts.vertices[i].y += verticesStartPosition.y;
  }

  mutRotateVertices2Around(opts.vertices, opts.angle, origin);
  mutRotateVertices2Around(opts.vertices, opts.parentAngle, opts.parentPosition);

  const normalAxes = normalAxes2(opts.vertices);

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
    _vertices: opts.vertices,
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

export function capsuleColliderComponent(opts: {
  parentPosition: Vector2; // TODO: remove this
  parentAngle: number; // TODO: remove this
  type: 'solid' | 'sensor';
  mass: number;
  offset: Vector2;
  length: number;
  radius: number;
  angle: number;
}): Component<typeof Collider>[] {
  const mass = opts.mass / 3;

  const rectangleSize = {
    width: opts.radius * 2,
    height: opts.length,
  };

  const rectangle = rectangleColliderComponent({
    parentPosition: opts.parentPosition,
    parentAngle: opts.parentAngle,
    type: opts.type,
    mass,
    offset: { x: opts.offset.x, y: opts.offset.y },
    angle: opts.angle,
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    size: rectangleSize,
  });

  const firstCircle = circleColliderComponent({
    parentPosition: opts.parentPosition,
    type: opts.type,
    parentAngle: opts.parentAngle,
    mass,
    offset: { x: opts.offset.x, y: opts.offset.y - rectangleSize.height / 2 },
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    radius: opts.radius,
  });

  const secondCircle = circleColliderComponent({
    parentPosition: opts.parentPosition,
    type: opts.type,
    parentAngle: opts.parentAngle,
    mass,
    offset: { x: opts.offset.x, y: opts.offset.y + rectangleSize.height / 2 },
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    radius: opts.radius,
  });

  mutRotateV2Around(firstCircle._position, opts.angle, rectangle._position);
  mutRotateV2Around(secondCircle._position, opts.angle, rectangle._position);

  return [firstCircle, rectangle, secondCircle];
}

export const ColliderBody = newSchema({
  parts: arrayOf(Collider),
});

import { newSchema, arrayOf, union, literal, number, newTag, Component } from '../../tecs';
import {
  Axes2,
  mutRotateVertices2Around,
  normalAxes2,
  normalV2,
  subV2,
  unitV2,
  Vector2,
  Vertices2,
} from '../core';

// # Check this object for collisions with any other Colliders
export const CollisionsMonitoring = newTag();

// # Forbid penetration of solid Colliders
export const Impenetrable = newTag();

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
  _position: Vector2,
  _origin: Vector2,
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
  const colliderPosition = {
    x: origin.x - opts.size.width * opts.anchor.x,
    y: origin.y - opts.size.height * opts.anchor.y,
  };
  const colliderVertices = [
    {
      x: colliderPosition.x,
      y: colliderPosition.y,
    },
    {
      x: colliderPosition.x + opts.size.width,
      y: colliderPosition.y,
    },
    {
      x: colliderPosition.x + opts.size.width,
      y: colliderPosition.y + opts.size.height,
    },
    {
      x: colliderPosition.x,
      y: colliderPosition.y + opts.size.height,
    },
  ];

  mutRotateVertices2Around(colliderVertices, opts.angle, origin);
  mutRotateVertices2Around(colliderVertices, opts.parentAngle, opts.parentPosition);

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
    _position: colliderPosition,
    _origin: origin,
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

  console.log('rectangle', component);

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

  const colliderPosition = {
    x: origin.x - width * opts.anchor.x,
    y: origin.y - height * opts.anchor.y,
  };

  // # Apply colliderPosition to vertices
  for (let i = 0; i < opts.vertices.length; i++) {
    opts.vertices[i].x += colliderPosition.x;
    opts.vertices[i].y += colliderPosition.y;
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
    _position: colliderPosition,
    _origin: origin,
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

  console.log('vertices', component);

  return component;
}

export function circleColliderComponent(opts: {
  parentPosition: Vector2; // TODO: remove this
  parentAngle: number; // TODO: remove this
  type: 'solid' | 'sensor';
  mass: number;
  offset: Vector2;
  angle: number;
  anchor: Vector2;
  radius: number;
}): Component<typeof Collider> {
  const origin = {
    x: opts.parentPosition.x + opts.offset.x,
    y: opts.parentPosition.y + opts.offset.y,
  };
  const colliderPosition = {
    x: origin.x - opts.radius + 2 * opts.radius * opts.anchor.x,
    y: origin.y - opts.radius + 2 * opts.radius * opts.anchor.y,
  };
  const colliderVertices: Axes2 = [];

  const normalAxes = normalAxes2(colliderVertices);

  return {
    type: opts.type,
    mass: opts.mass,
    offset: opts.offset,
    angle: opts.angle,
    shape: {
      type: 'circle' as const,
      anchor: opts.anchor,
      radius: opts.radius,
    },
    _position: colliderPosition,
    _origin: origin,
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
}

export const ColliderSet = newSchema({
  list: arrayOf(Collider),
});

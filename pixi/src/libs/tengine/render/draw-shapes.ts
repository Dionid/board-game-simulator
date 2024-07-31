import { Container, Graphics } from 'pixi.js';
import { Position2, Size2, Vector2 } from '../core';
import { Component, KindToType } from 'libs/tecs';
import { View } from './components';

export function rectangleViewPivot(size: Size2, anchor: Vector2) {
  return {
    x: size.width * anchor.x,
    y: size.height * anchor.y,
  };
}

export function rectangleView(view: Component<typeof View>, position: Position2) {
  if (view.model.type !== 'graphics' || view.model.shape.type !== 'rectangle') {
    return;
  }

  const anchor = view.anchor;

  const start = {
    x: position.x + view.offset.x,
    y: position.y + view.offset.y,
  };

  const rectContainer = new Container({
    x: start.x,
    y: start.y,
    rotation: view.rotation,
    width: view.model.shape.size.width,
    height: view.model.shape.size.height,
    pivot: rectangleViewPivot(view.model.shape.size, anchor),
  });

  const rect = new Graphics().rect(0, 0, view.model.shape.size.width, view.model.shape.size.height);

  rectContainer.addChild(rect);

  return {
    container: rectContainer,
    graphics: rect,
  };
}

export function circleViewPivot(radius: number, anchor: Vector2) {
  return {
    x: 2 * radius * anchor.x - radius,
    y: 2 * radius * anchor.y - radius,
  };
}

export function circleView(view: KindToType<typeof View>, position: Position2) {
  if (view.model.type !== 'graphics' || view.model.shape.type !== 'circle') {
    return;
  }

  const container = new Container({
    x: position.x + view.offset.x,
    y: position.y + view.offset.y,
    rotation: view.rotation,
    pivot: circleViewPivot(view.model.shape.radius, view.anchor),
  });

  const graphics = new Graphics().circle(0, 0, view.model.shape.radius);

  container.addChild(graphics);

  return {
    graphics,
    container,
  };
}

// export function drawCapsule(view: KindToType<typeof View>, position: Position2) {
//   if (view.model.type !== 'graphics' || view.model.shape.type !== 'capsule') {
//     return;
//   }

//   // # Draw capsule
//   const anchor = view.model.shape.anchor;

//   const length = view.model.shape.length;
//   const radius = view.model.shape.radius;

//   const start = {
//     x: position.x + view.offset.x + radius - radius * 2 * anchor.x,
//     y: position.y + view.offset.y - length * anchor.y,
//   };

//   const end = {
//     x: start.x,
//     y: start.y + length,
//   };

//   const graphics = new Graphics();

//   // # Outer
//   // ## Calculate arcs angel to horizontal line
//   const refDirection = unitV2(subV2(end, start));
//   let refAngle = Math.acos(dotV2(refDirection, horizontalVector));

//   if (crossV2(refDirection, horizontalVector) > 0) {
//     refAngle = -refAngle;
//   }

//   graphics.beginPath();

//   graphics.arc(start.x, start.y, radius, refAngle + Math.PI / 2, refAngle + (3 * Math.PI) / 2);
//   graphics.arc(end.x, end.y, radius, refAngle - Math.PI / 2, refAngle + Math.PI / 2);

//   graphics.closePath();

//   return graphics;
// }

// export function drawLine(view: KindToType<typeof View>, position: Position2) {
//   if (view.model.type !== 'graphics' || view.model.shape.type !== 'line') {
//     return;
//   }

//   // # Draw capsule
//   const anchor = view.model.shape.anchor;

//   const length = view.model.shape.length;

//   const start = {
//     x: position.x + view.offset.x,
//     y: position.y + view.offset.y - length * anchor,
//   };

//   const end = {
//     x: start.x,
//     y: start.y + length,
//   };

//   const graphics = new Graphics();

//   graphics.moveTo(start.x, start.y);
//   graphics.lineTo(end.x, end.y);
//   graphics.stroke({
//     width: 1,
//     color: view.model.color,
//   });

//   return graphics;
// }

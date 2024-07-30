import { Container, Graphics } from 'pixi.js';
import { crossV2, dotV2, horizontalVector, Position2, subV2, unitV2 } from '../core';
import { KindToType } from 'libs/tecs';
import { View } from './components';

export function drawRectangle(view: KindToType<typeof View>, position: Position2) {
  if (view.model.type !== 'graphics' || view.model.shape.type !== 'rectangle') {
    return;
  }

  const anchor = view.model.shape.anchor;

  const start = {
    x: position.x + view.offset.x,
    y: position.y + view.offset.y,
  };

  // # Somehow pivot and rotation works only if it is in its own container
  const rectContainer = new Container({
    x: start.x,
    y: start.y,
    rotation: view.rotation,
    width: view.model.shape.size.width,
    height: view.model.shape.size.height,
    pivot: {
      x: view.model.shape.size.width * anchor.x,
      y: view.model.shape.size.height * anchor.y,
    },
  });

  const rect = new Graphics().rect(0, 0, view.model.shape.size.width, view.model.shape.size.height);

  rectContainer.addChild(rect);

  return {
    rectContainer,
    rect,
  };
}

export function drawCircle(view: KindToType<typeof View>, position: Position2) {
  if (view.model.type !== 'graphics' || view.model.shape.type !== 'circle') {
    return;
  }

  return new Graphics().circle(
    position.x +
      view.offset.x +
      view.model.shape.radius -
      view.model.shape.radius * 2 * view.model.shape.anchor.x,
    position.y +
      view.offset.y +
      view.model.shape.radius -
      view.model.shape.radius * 2 * view.model.shape.anchor.y,
    view.model.shape.radius
  );
}

export function drawCapsule(view: KindToType<typeof View>, position: Position2) {
  if (view.model.type !== 'graphics' || view.model.shape.type !== 'capsule') {
    return;
  }

  // # Draw capsule
  const anchor = view.model.shape.anchor;

  const length = view.model.shape.length;
  const radius = view.model.shape.radius;

  const start = {
    x: position.x + view.offset.x + radius - radius * 2 * anchor.x,
    y: position.y + view.offset.y - length * anchor.y,
  };

  const end = {
    x: start.x,
    y: start.y + length,
  };

  const graphics = new Graphics();

  // # Outer
  // ## Calculate arcs angel to horizontal line
  const refDirection = unitV2(subV2(end, start));
  let refAngle = Math.acos(dotV2(refDirection, horizontalVector));

  if (crossV2(refDirection, horizontalVector) > 0) {
    refAngle = -refAngle;
  }

  graphics.beginPath();

  graphics.arc(start.x, start.y, radius, refAngle + Math.PI / 2, refAngle + (3 * Math.PI) / 2);
  graphics.arc(end.x, end.y, radius, refAngle - Math.PI / 2, refAngle + Math.PI / 2);

  graphics.closePath();

  return graphics;
}

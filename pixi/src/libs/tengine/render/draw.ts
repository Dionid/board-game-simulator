import { Container, Graphics } from 'pixi.js';
import { Position2 } from '../core';
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

import { Color, Graphics } from 'pixi.js';
import { System } from '../../tecs';
import { Map } from '../core';
import RAPIER from '@dimforge/rapier2d-compat';

export const rapierDrawDebugLines = (map: Map, physicsWorld: RAPIER.World): System => {
  const globalGraphics = new Graphics();
  map.container.addChild(globalGraphics);

  return () => {
    globalGraphics.clear();

    const { vertices, colors } = physicsWorld.debugRender();

    for (let i = 0; i < vertices.length / 4; i += 1) {
      const c = new Color({
        r: colors[i * 4] * 255,
        g: colors[i * 4 + 1] * 255,
        b: colors[i * 4 + 2] * 255,
        a: colors[i * 4 + 3] * 255,
      });

      const start = {
        x: vertices[i * 4],
        y: vertices[i * 4 + 1],
      };

      const end = {
        x: vertices[i * 4 + 2],
        y: vertices[i * 4 + 3],
      };

      globalGraphics.stroke({ width: 2, color: '#fff', alpha: 1 });
      globalGraphics.moveTo(start.x, start.y);
      globalGraphics.lineTo(end.x, end.y);
      globalGraphics.closePath();
    }
  };
};

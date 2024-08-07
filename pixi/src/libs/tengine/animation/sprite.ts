import { AnimatedSprite, Texture } from 'pixi.js';
import { Vector2 } from '../core';

export function newAnimationFrames(start: number, end: number, prefix: string, postfix: string) {
  const frames = [];
  for (let i = start; i <= end; i++) {
    frames.push(`${prefix}${i}${postfix}`);
  }
  return frames;
}

export function newDirectionalAnimationFrames<
  Prefix extends string,
  D extends ReadonlyArray<string>
>(
  directions: D,
  animationNamePrefix: Prefix,
  animationPrefix: string,
  frame: {
    start: number;
    end: number;
    prefix: string;
    postfix: string;
  }
): Record<`${Prefix}${D[number]}`, string[]> {
  const frames: Record<string, string[]> = {};
  for (let i = 0; i < directions.length; i++) {
    const direction = directions[i];

    frames[`${animationNamePrefix}${direction}`] = newAnimationFrames(
      frame.start,
      frame.end,
      `${animationPrefix}${i}${frame.prefix}`,
      frame.postfix
    );
  }
  return frames;
}

export function newAnimatedSprites<A extends Record<string | number, Texture[]>>(
  animations: A,
  anchor: Vector2 = { x: 0, y: 0 }
): {
  [K in keyof A]: AnimatedSprite;
} {
  const sprites = {} as {
    [K in keyof A]: AnimatedSprite;
  };

  for (const [name, frames] of Object.entries(animations)) {
    const sprite = new AnimatedSprite(frames);
    sprite.anchor.set(anchor.x, anchor.y);

    sprites[name as keyof A] = sprite;
  }

  return sprites;
}

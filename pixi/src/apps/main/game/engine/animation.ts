export function newAnimationFrames(start: number, end: number, prefix: string, postfix: string) {
  const frames = [];
  for (let i = start; i <= end; i++) {
    frames.push(`${prefix}${i}${postfix}`);
  }
  return frames;
}

export function newDirectionalAnimationFrames<Prefix extends string, D extends ReadonlyArray<string>>(
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

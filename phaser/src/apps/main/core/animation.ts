export const directions = ['tr', 'r', 'br', 'b', 'bl', 'l', 'tl', 't'];

export const generateOneFrameAnimation = (scene: Phaser.Scene, prefix: string, animationName: string) => {
  for (let i = 0; i < directions.length; i++) {
    scene.anims.create({
      key: prefix + '-' + directions[i],
      frames: [
        {
          key: 'human',
          frame: `Human_${i}_${animationName}0.png`,
        },
      ],
    });
  }
};

export const generateMultipleFramesAnimation = (
  scene: Phaser.Scene,
  prefix: string,
  animationName: string,
  maxFrames: number
) => {
  for (let i = 0; i < directions.length; i++) {
    scene.anims.create({
      key: prefix + '-' + directions[i],
      frames: scene.anims.generateFrameNames('human', {
        start: 0,
        end: maxFrames,
        prefix: `Human_${i}_${animationName}`,
        suffix: '.png',
      }),
      repeat: -1,
      frameRate: 15,
    });
  }
};

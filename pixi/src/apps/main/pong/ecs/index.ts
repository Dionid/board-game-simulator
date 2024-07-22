import { System } from '../../../../libs/tecs';
import { Game } from '../../../../libs/tengine/game';

export type Directions = 'up' | 'down' | 'left' | 'right';

export const moveByArrows = (game: Game): System => {
  const input = game.input;
  const keyboard = input.keyboard;

  const getDirection = (): Directions | null => {
    if (keyboard.keyDown['ArrowUp'] || keyboard.keyDown['w']) {
      return 'up';
    }

    if (keyboard.keyDown['ArrowDown'] || keyboard.keyDown['s']) {
      return 'down';
    }

    if (keyboard.keyDown['ArrowLeft'] || keyboard.keyDown['a']) {
      return 'left';
    }

    if (keyboard.keyDown['ArrowRight'] || keyboard.keyDown['d']) {
      return 'right';
    }

    return null;
  };

  return () => {
    const direction = getDirection();
    if (direction === 'up') {
      console.log('up');
    }
    if (direction === 'down') {
      console.log('down');
    }
    if (direction === 'left') {
      console.log('left');
    }
    if (direction === 'right') {
      console.log('right');
    }
  };
};

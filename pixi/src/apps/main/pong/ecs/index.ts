import { archetypeByEntity, Entity, newTag, System, tryTable } from '../../../../libs/tecs';
import { Position } from '../../../../libs/tengine/ecs';
import { Game } from '../../../../libs/tengine/game';

export const Player = newTag();

export type Directions = 'up' | 'down' | 'left' | 'right';

export const moveByArrows = (game: Game, playerEntity: Entity): System => {
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

    if (!direction) {
      return;
    }

    const playerArchetype = archetypeByEntity(game.essence, playerEntity);

    if (!playerArchetype) {
      return;
    }

    const positionT = tryTable(playerArchetype, Position);

    if (!positionT) {
      return;
    }

    const position = positionT[0];

    if (!position) {
      return;
    }

    switch (direction) {
      case 'up':
        position.y -= 5;
        break;
      case 'down':
        position.y += 5;
        break;
    }
  };
};

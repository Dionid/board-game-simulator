import {
  archetypeByEntity,
  componentByEntity,
  Entity,
  newTag,
  registerTopic,
  System,
  tryComponent,
  tryTable,
} from 'libs/tecs';
import { collideStartedTopic } from 'libs/tengine/collision';
import {
  KeyBoardInput,
  Acceleration2,
  Speed,
  Velocity2,
  normalizeV2,
  mutMultV2,
  Position2,
  Vector2,
  Size2,
} from 'libs/tengine/core';
import { Game } from 'libs/tengine/game';
import { scores, uiState } from '../state';

// export const GameObject = newTag();

export const Player = newTag();
export const Enemy = newTag();
export const Ball = newTag();

export const Goals = newTag();
export const PlayerGoals = newTag();
export const EnemyGoals = newTag();

export type Directions = 'up' | 'down' | 'left' | 'right';

const getXDirection = (keyboard: KeyBoardInput): number => {
  if (keyboard.keyDown['ArrowRight'] || keyboard.keyDown['d']) {
    return 1;
  }

  if (keyboard.keyDown['ArrowLeft'] || keyboard.keyDown['a']) {
    return -1;
  }

  return 0;
};

const getYDirection = (keyboard: KeyBoardInput): number => {
  if (keyboard.keyDown['ArrowUp'] || keyboard.keyDown['w']) {
    return -1;
  }

  if (keyboard.keyDown['ArrowDown'] || keyboard.keyDown['s']) {
    return 1;
  }

  return 0;
};

export const accelerateByArrows = (game: Game, playerEntity: Entity): System => {
  const input = game.input;
  const keyboard = input.keyboard;

  return ({ deltaTime }) => {
    const playerArchetype = archetypeByEntity(game.essence, playerEntity);

    if (!playerArchetype) {
      return;
    }

    const accelerationT = tryTable(playerArchetype, Acceleration2);

    if (!accelerationT) {
      return;
    }

    const acceleration = accelerationT[0];

    if (!acceleration) {
      return;
    }

    const speedT = tryTable(playerArchetype, Speed);

    if (!speedT) {
      return;
    }

    const speed = speedT[0];

    if (!speed) {
      return;
    }

    const directionY = getYDirection(keyboard);
    const directionX = getXDirection(keyboard);

    const newAcc = normalizeV2({
      x: speed.value * directionX,
      y: speed.value * directionY,
    });
    mutMultV2(newAcc, speed.value);

    acceleration.x = newAcc.x * deltaTime;
    acceleration.y = newAcc.y * deltaTime;
  };
};

export const changeVelocityByArrows = (game: Game, charEntity: Entity): System => {
  const input = game.input;
  const keyboard = input.keyboard;

  return ({ deltaTime }) => {
    const charArchetype = archetypeByEntity(game.essence, charEntity);

    if (!charArchetype) {
      return;
    }

    const velocityT = tryTable(charArchetype, Velocity2);

    if (!velocityT) {
      return;
    }

    const velocity = velocityT[0];

    if (!velocity) {
      return;
    }

    const speedT = tryTable(charArchetype, Speed);

    if (!speedT) {
      return;
    }

    const speed = speedT[0];

    if (!speed) {
      return;
    }

    const directionY = getYDirection(keyboard);
    const directionX = getXDirection(keyboard);

    const newVel = normalizeV2({
      x: speed.value * directionX,
      y: speed.value * directionY,
    });
    mutMultV2(newVel, speed.value);

    velocity.x = newVel.x * deltaTime;
    velocity.y = newVel.y * deltaTime;
  };
};

export function scoring(
  game: Game,
  playerEntity: Entity,
  enemyEntity: Entity,
  initialBallPosition: Vector2,
  initialPlayerPosition: Vector2,
  initialEnemyPosition: Vector2
): System {
  registerTopic(game.essence, collideStartedTopic);

  return () => {
    for (const event of collideStartedTopic) {
      const { a, b } = event;

      const aGoalsT = tryTable(a.archetype, Goals);
      const aBallT = tryTable(a.archetype, Ball);
      const bGoalsT = tryTable(b.archetype, Goals);
      const bBallT = tryTable(b.archetype, Ball);

      // # If none are goals or ball, than ignore
      if ((aBallT && bGoalsT) || (aGoalsT && bBallT)) {
        const ball = aBallT ? a : b;
        const goals = aGoalsT ? a : b;

        const isPlayerGoals = tryComponent(goals.archetype, goals.entity, PlayerGoals);
        const isEnemyGoals = tryComponent(goals.archetype, goals.entity, EnemyGoals);

        if (isPlayerGoals) {
          uiState.set(scores, (prev) => {
            return {
              ...prev,
              enemy: prev.enemy + 1,
            };
          });
        } else if (isEnemyGoals) {
          uiState.set(scores, (prev) => {
            return {
              ...prev,
              player: prev.player + 1,
            };
          });
        }

        // # Reset ball
        const position = tryComponent(ball.archetype, ball.entity, Position2)!;
        const velocity = tryComponent(ball.archetype, ball.entity, Velocity2)!;
        const acceleration = tryComponent(ball.archetype, ball.entity, Acceleration2)!;

        velocity.x = 0;
        velocity.y = 0;

        acceleration.x = 0;
        acceleration.y = 0;

        position.x = initialBallPosition.x;
        position.y = initialBallPosition.y;

        // # Reset characters
        const playerPosition = componentByEntity(game.essence, playerEntity, Position2)!;

        playerPosition.x = initialPlayerPosition.x;
        playerPosition.y = initialPlayerPosition.y;

        const enemyPosition = componentByEntity(game.essence, enemyEntity, Position2)!;

        enemyPosition.x = initialEnemyPosition.x;
        enemyPosition.y = initialEnemyPosition.y;

        // # Restart ball
        setTimeout(() => {
          const randomAngle = Math.random() * Math.PI * 2;

          velocity.x = Math.cos(randomAngle) * 7;
          velocity.y = Math.sin(randomAngle) * 7;
        }, 1000);

        return;
      }
    }
  };
}

export function paddleWorldBoundaries(
  game: Game,
  playerEntity: Entity,
  enemyEntity: Entity,
  characterSize: Size2
): System {
  return () => {
    const playerPosition = componentByEntity(game.essence, playerEntity, Position2)!;
    const enemyPosition = componentByEntity(game.essence, enemyEntity, Position2)!;

    if (playerPosition.y < characterSize.height / 2) {
      playerPosition.y = characterSize.height / 2;
    } else if (playerPosition.y > game.world.size.height - characterSize.height / 2) {
      playerPosition.y = game.world.size.height - characterSize.height / 2;
    }

    if (playerPosition.x < characterSize.width / 2) {
      playerPosition.x = characterSize.width / 2;
    } else if (playerPosition.x > game.world.size.width / 2 - characterSize.width / 2) {
      playerPosition.x = game.world.size.width / 2 - characterSize.width / 2;
    }

    if (enemyPosition.y < characterSize.height / 2) {
      enemyPosition.y = characterSize.height / 2;
    } else if (enemyPosition.y > game.world.size.height - characterSize.height / 2) {
      enemyPosition.y = game.world.size.height - characterSize.height / 2;
    }

    if (enemyPosition.x > game.world.size.width - characterSize.width / 2) {
      enemyPosition.x = game.world.size.width - characterSize.width / 2;
    } else if (enemyPosition.x < game.world.size.width / 2 + characterSize.width / 2) {
      enemyPosition.x = game.world.size.width / 2 + characterSize.width / 2;
    }
  };
}

export function enemyAi(
  game: Game,
  enemyEntity: Entity,
  ballEntity: Entity,
  enemyGoalsEntity: Entity,
  enemySize: Size2
): System {
  return ({ deltaTime }) => {
    const enemyAcceleration = componentByEntity(game.essence, enemyEntity, Acceleration2);
    if (!enemyAcceleration) {
      return;
    }

    const enemySpeed = componentByEntity(game.essence, enemyEntity, Speed);
    if (!enemySpeed) {
      return;
    }

    const enemyPosition = componentByEntity(game.essence, enemyEntity, Position2);
    if (!enemyPosition) {
      return;
    }

    const ballPosition = componentByEntity(game.essence, ballEntity, Position2);
    if (!ballPosition) {
      return;
    }

    if (ballPosition.y > enemyPosition.y + 10) {
      enemyAcceleration.y = enemySpeed.value * deltaTime;
    } else if (ballPosition.y < enemyPosition.y - 10) {
      enemyAcceleration.y = -enemySpeed.value * deltaTime;
    } else {
      enemyAcceleration.y = 0;
    }

    if (ballPosition.x > game.world.size.width / 2) {
      enemyAcceleration.x = -enemySpeed.value * deltaTime;
    } else {
      enemyAcceleration.x = enemySpeed.value * deltaTime;
    }

    if (enemyPosition.x - enemySize.width / 2 - 1 < ballPosition.x) {
      enemyAcceleration.x = enemySpeed.value * deltaTime;
    }

    const goalsPosition = componentByEntity(game.essence, enemyGoalsEntity, Position2);

    if (!goalsPosition) {
      return;
    }

    if (enemyPosition.x >= goalsPosition.x - 150) {
      // enemyPosition.x = goalsPosition.x - 151;
      if (enemyAcceleration.x > 0) {
        enemyAcceleration.x *= 0.3;
        if (enemyAcceleration.x < 0.1) {
          enemyAcceleration.x = 0;
        }
      }
    }

    if (enemyPosition.x >= goalsPosition.x - 50) {
      enemyPosition.x = goalsPosition.x - 51;
    }
  };
}

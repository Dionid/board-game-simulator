import {
  archetypeByEntity,
  componentByEntity,
  Entity,
  newTag,
  registerTopic,
  setComponent,
  System,
  tryComponent,
  tryTable,
} from 'libs/tecs';
import { collisionStartedTopic } from 'libs/tengine/collision';
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
import { safeGuard } from 'libs/tecs/switch';
import { TranslateAnimation } from 'libs/tengine/animation';

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

export const accelerateByArrows = (
  game: Game,
  playerEntity: Entity,
  roundStarted: { value: boolean }
): System => {
  const input = game.input;
  const keyboard = input.keyboard;

  return ({ deltaTime }) => {
    if (!roundStarted.value) {
      return;
    }

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

export const changeVelocityByArrows = (
  game: Game,
  charEntity: Entity,
  roundStarted: { value: boolean }
): System => {
  const input = game.input;
  const keyboard = input.keyboard;

  return ({ deltaTime }) => {
    if (!roundStarted.value) {
      return;
    }

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

export function resetRound(
  game: Game,
  initialBallPosition: Vector2,
  initialPlayerPosition: Vector2,
  initialEnemyPosition: Vector2,
  ballEntity: Entity,
  ballVelocity: Vector2,
  ballAcceleration: Vector2,
  playerEntity: Entity,
  playerVelocity: Vector2,
  playerAcceleration: Vector2,
  enemyEntity: Entity,
  enemyVelocity: Vector2,
  enemyAcceleration: Vector2,
  roundStarted: { value: boolean }
) {
  ballVelocity.x = 0;
  ballVelocity.y = 0;
  ballAcceleration.x = 0;
  ballAcceleration.y = 0;
  // ballPosition.x = initialBallPosition.x;
  // ballPosition.y = initialBallPosition.y;

  setComponent(game.essence, ballEntity, TranslateAnimation, {
    x: initialBallPosition.x,
    y: initialBallPosition.y,
    duration: 1000,
    easing: 'easeIn',
    startTime: game.essence.currentStepTime,
  });

  setComponent(game.essence, playerEntity, TranslateAnimation, {
    x: initialPlayerPosition.x,
    y: initialPlayerPosition.y,
    duration: 1000,
    easing: 'easeIn',
    startTime: game.essence.currentStepTime,
  });

  // playerPosition.x = initialPlayerPosition.x;
  // playerPosition.y = initialPlayerPosition.y;
  playerVelocity.x = 0;
  playerVelocity.y = 0;
  playerAcceleration.x = 0;
  playerAcceleration.y = 0;

  setComponent(game.essence, enemyEntity, TranslateAnimation, {
    x: initialEnemyPosition.x,
    y: initialEnemyPosition.y,
    duration: 1000,
    easing: 'easeIn',
    startTime: game.essence.currentStepTime,
  });
  // enemyPosition.x = initialEnemyPosition.x;
  // enemyPosition.y = initialEnemyPosition.y;
  enemyVelocity.x = 0;
  enemyVelocity.y = 0;
  enemyAcceleration.x = 0;
  enemyAcceleration.y = 0;

  roundStarted.value = false;

  // # Restart ball
  setTimeout(() => {
    const randomAngle = Math.random() * Math.PI * 2;

    ballVelocity.x = Math.cos(randomAngle) * 5;
    ballVelocity.y = Math.sin(randomAngle) * 5;

    roundStarted.value = true;
  }, 1300);
}

export function scoring(
  game: Game,
  playerEntity: Entity,
  enemyEntity: Entity,
  initialBallPosition: Vector2,
  initialPlayerPosition: Vector2,
  initialEnemyPosition: Vector2,
  roundStarted: { value: boolean }
): System {
  registerTopic(game.essence, collisionStartedTopic);

  return () => {
    for (const event of collisionStartedTopic) {
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
        const ballVelocity = tryComponent(ball.archetype, ball.entity, Velocity2)!;
        const ballAcceleration = tryComponent(ball.archetype, ball.entity, Acceleration2)!;

        // # Reset characters
        const playerVelocity = componentByEntity(game.essence, playerEntity, Velocity2)!;
        const playerAcceleration = componentByEntity(game.essence, playerEntity, Acceleration2)!;

        const enemyVelocity = componentByEntity(game.essence, enemyEntity, Velocity2)!;
        const enemyAcceleration = componentByEntity(game.essence, enemyEntity, Acceleration2)!;

        resetRound(
          game,
          initialBallPosition,
          initialPlayerPosition,
          initialEnemyPosition,
          ball.entity,
          ballVelocity,
          ballAcceleration,
          playerEntity,
          playerVelocity,
          playerAcceleration,
          enemyEntity,
          enemyVelocity,
          enemyAcceleration,
          roundStarted
        );

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

    if (playerPosition.x < characterSize.width / 2 + 50) {
      playerPosition.x = characterSize.width / 2 + 51;
    } else if (playerPosition.x > game.world.size.width / 2 - characterSize.width / 2) {
      playerPosition.x = game.world.size.width / 2 - characterSize.width / 2;
    }

    if (enemyPosition.y < characterSize.height / 2) {
      enemyPosition.y = characterSize.height / 2;
    } else if (enemyPosition.y > game.world.size.height - characterSize.height / 2) {
      enemyPosition.y = game.world.size.height - characterSize.height / 2;
    }

    if (enemyPosition.x > game.world.size.width - characterSize.width / 2 - 50) {
      enemyPosition.x = game.world.size.width - characterSize.width / 2 - 51;
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
  enemySize: Size2,
  roundStarted: { value: boolean },
  opts: {
    enemyTactics?: 'center' | 'follow';
  } = {}
): System {
  const enemyTactics = opts.enemyTactics || 'follow';

  return ({ deltaTime }) => {
    if (roundStarted.value === false) {
      return;
    }

    const enemyAcceleration = componentByEntity(game.essence, enemyEntity, Acceleration2);
    const enemyVelocity = componentByEntity(game.essence, enemyEntity, Velocity2);
    const enemySpeed = componentByEntity(game.essence, enemyEntity, Speed);
    const enemyPosition = componentByEntity(game.essence, enemyEntity, Position2);
    const ballPosition = componentByEntity(game.essence, ballEntity, Position2);

    if (!enemyAcceleration || !enemyVelocity) {
      return;
    }
    if (!enemySpeed) {
      return;
    }
    if (!enemyPosition) {
      return;
    }
    if (!ballPosition) {
      return;
    }

    // # Follow ball Y

    // # Go to ball X when it is on enemy side of field
    switch (enemyTactics) {
      case 'center': {
        if (ballPosition.x >= game.world.size.width / 2) {
          enemyAcceleration.x = -enemySpeed.value * 0.9 * deltaTime;
          // # Move to ball Y
          if (ballPosition.y > enemyPosition.y + 10) {
            enemyAcceleration.y = enemySpeed.value * deltaTime;
          } else if (ballPosition.y < enemyPosition.y - 10) {
            enemyAcceleration.y = -enemySpeed.value * deltaTime;
          } else {
            enemyAcceleration.y = 0;
          }
        } else {
          enemyAcceleration.x = enemySpeed.value * deltaTime;
          // # Move to center Y
          if (enemyPosition.y > game.world.size.height / 2 + 20) {
            enemyAcceleration.y = -enemySpeed.value * deltaTime;
          } else if (enemyPosition.y < game.world.size.height / 2 - 20) {
            enemyAcceleration.y = enemySpeed.value * deltaTime;
          } else {
            enemyAcceleration.y = 0;
          }
        }
        break;
      }
      case 'follow': {
        // # Follow ball Y
        if (ballPosition.y > enemyPosition.y + 10) {
          enemyAcceleration.y = enemySpeed.value * deltaTime;
        } else if (ballPosition.y < enemyPosition.y - 10) {
          enemyAcceleration.y = -enemySpeed.value * deltaTime;
        } else {
          enemyAcceleration.y = 0;
        }

        // # Go to ball X when it is on enemy side of field
        if (ballPosition.x > game.world.size.width / 2) {
          enemyAcceleration.x = -enemySpeed.value * 0.9 * deltaTime;
        } else {
          enemyAcceleration.x = enemySpeed.value * deltaTime;
        }
        break;
      }
      default:
        return safeGuard(enemyTactics);
    }

    // # If ball going behind enemy, go back
    if (
      ballPosition.y > enemyPosition.y + enemySize.height / 2 ||
      ballPosition.y < enemyPosition.y - enemySize.height / 2
    ) {
      if (enemyPosition.x < ballPosition.x + enemySize.width + 50) {
        enemyAcceleration.x = enemySpeed.value * deltaTime;
        enemyAcceleration.y = 0;
      }
    }

    // # Goals boundaries
    const goalsPosition = componentByEntity(game.essence, enemyGoalsEntity, Position2);

    if (!goalsPosition) {
      return;
    }

    if (ballPosition.x < game.world.size.width / 2) {
      if (enemyPosition.x >= goalsPosition.x - 200) {
        if (enemyAcceleration.x > 0) {
          enemyAcceleration.x *= 0.2;
          if (enemyAcceleration.x < 0.1) {
            enemyAcceleration.x = 0;
          }
        }
      }
    }
  };
}

export function ballTunneling(game: Game, ballEntity: Entity): System {
  return () => {
    const ballPosition = componentByEntity(game.essence, ballEntity, Position2)!;

    if (
      ballPosition.x < 0 ||
      ballPosition.x > game.world.size.width ||
      ballPosition.y < 0 ||
      ballPosition.y > game.world.size.height
    ) {
      if (game.world.size.width / 2 <= ballPosition.x) {
        ballPosition.x -= 50;
      } else {
        ballPosition.x += 50;
      }

      if (game.world.size.height / 2 <= ballPosition.y) {
        ballPosition.y -= 50;
      } else {
        ballPosition.y += 50;
      }
    }
  };
}

export const changeBallDirectionBasedOnPaddleVelocity = (
  game: Game,
  playerEntity: Entity,
  enemyEntity: Entity,
  ballEntity: Entity
) => {
  return () => {
    for (const event of collisionStartedTopic) {
      const { a, b } = event;

      let character;

      if (a.entity === playerEntity || a.entity === enemyEntity) {
        character = a;
      } else if (b.entity === playerEntity || b.entity === enemyEntity) {
        character = b;
      } else {
        return;
      }

      let ball;

      if (a.entity === ballEntity) {
        ball = a;
      } else if (b.entity === ballEntity) {
        ball = b;
      } else {
        return;
      }

      const characterVelocity = tryComponent(character.archetype, character.entity, Velocity2);
      const ballVelocity = tryComponent(ball.archetype, ball.entity, Velocity2);

      // # Add paddle y velocity to ball to make paddle movement more angular impactful
      if (characterVelocity && ballVelocity) {
        ballVelocity.y += characterVelocity.y * 0.7;
      }
    }
  };
};

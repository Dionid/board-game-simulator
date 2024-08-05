import { registerSystem } from 'libs/tecs';
import { Game } from '../game';
import { DEBUG } from './core';
import { drawDebug } from './render';
import { debugEvents } from './events';

export function activateDebugMode(
  game: Game,
  options: {
    render?: {
      view?: boolean;
      xy?: boolean;
      collision?: boolean;
      velocity?: boolean;
      acceleration?: boolean;
    };
    events?: {
      entitySpawned?: boolean;
      entityKilled?: boolean;
      schemaAdded?: boolean;
      schemaRemoved?: boolean;
      componentUpdated?: boolean;
    };
  } = {}
) {
  DEBUG.isActive = true;

  // # Render debug lines
  registerSystem(game.essence, drawDebug(game, options.render || {}), {
    stage: 'postUpdate',
  });

  // # Debug default events
  registerSystem(game.essence, debugEvents(game, options.events), {
    stage: 'postUpdate',
  });
}

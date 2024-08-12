import { registerSystem } from 'libs/tecs';
import { Game } from '../game';
import { DEBUG } from './core';
import { DebugOptions, drawDebug } from './render';
import { debugEvents, DebugEventsOptions } from './events';

export function activateDebugMode(
  game: Game,
  options: {
    render?: DebugOptions;
    events?: DebugEventsOptions;
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

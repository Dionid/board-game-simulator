import { registerSystem, registerTopic } from 'libs/tecs';
import { Game } from '../game';
import { DEBUG } from './core';
import { drawDebug } from './render';
import {
  componentUpdated,
  entityKilled,
  entitySpawned,
  schemaAdded,
  schemaRemoved,
} from 'libs/tecs/default-topics';

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

  const events = options.events ?? {
    entitySpawned: true,
    entityKilled: true,
    schemaAdded: true,
    schemaRemoved: true,
    componentUpdated: true,
  };

  if (events.entitySpawned) {
    registerTopic(game.essence, entitySpawned);
  }
  if (events.entityKilled) {
    registerTopic(game.essence, entityKilled);
  }
  if (events.schemaAdded) {
    registerTopic(game.essence, schemaAdded);
  }
  if (events.schemaRemoved) {
    registerTopic(game.essence, schemaRemoved);
  }
  if (events.componentUpdated) {
    registerTopic(game.essence, componentUpdated);
  }

  // # Render debug lines
  registerSystem(game.essence, drawDebug(game, options.render || {}), {
    stage: 'postUpdate',
  });

  // # Debug default events
  registerSystem(
    game.essence,
    () => {
      if (events.entitySpawned) {
        for (const event of entitySpawned) {
          console.log('Entity spawned:', event);
        }
      }

      if (events.entityKilled) {
        for (const event of entityKilled) {
          console.log('Entity killed:', event);
        }
      }

      if (events.schemaAdded) {
        for (const event of schemaAdded) {
          console.log('Schema added:', event);
        }
      }

      if (events.schemaRemoved) {
        for (const event of schemaRemoved) {
          console.log('Schema removed:', event);
        }
      }

      if (events.componentUpdated) {
        for (const event of componentUpdated) {
          console.log('Component updated:', event);
        }
      }
    },
    {
      stage: 'postUpdate',
    }
  );
}

import { registerTopic, TopicEvent, topicEventMeta } from 'libs/tecs';
import {
  entitySpawned,
  entityKilled,
  schemaAdded,
  schemaRemoved,
  componentUpdated,
} from 'libs/tecs/default-topics';
import { Game } from '../game';

export function debugEvents(
  game: Game,
  opts: {
    entitySpawned?: boolean;
    entityKilled?: boolean;
    schemaAdded?: boolean;
    schemaRemoved?: boolean;
    componentUpdated?: boolean;
  } = {
    entitySpawned: true,
    entityKilled: true,
    schemaAdded: true,
    schemaRemoved: true,
    componentUpdated: true,
  }
) {
  if (opts.entitySpawned) {
    registerTopic(game.essence, entitySpawned);
  }
  if (opts.entityKilled) {
    registerTopic(game.essence, entityKilled);
  }
  if (opts.schemaAdded) {
    registerTopic(game.essence, schemaAdded);
  }
  if (opts.schemaRemoved) {
    registerTopic(game.essence, schemaRemoved);
  }
  if (opts.componentUpdated) {
    registerTopic(game.essence, componentUpdated);
  }

  let counter = 0;

  return () => {
    const events: TopicEvent<Record<PropertyKey, any>>[] = [];

    if (opts.entitySpawned) {
      for (const event of entitySpawned) {
        events.push(event);
      }
    }

    if (opts.entityKilled) {
      for (const event of entityKilled) {
        events.push(event);
      }
    }

    if (opts.schemaAdded) {
      for (const event of schemaAdded) {
        events.push(event);
      }
    }

    if (opts.schemaRemoved) {
      for (const event of schemaRemoved) {
        events.push(event);
      }
    }

    if (opts.componentUpdated) {
      for (const event of componentUpdated) {
        events.push(event);
      }
    }

    events.sort((a, b) => {
      return a[topicEventMeta].createdAt - b[topicEventMeta].createdAt;
    });

    for (const event of events) {
      counter++;
      console.log(`(de) ${counter}:`, event);
    }
  };
}

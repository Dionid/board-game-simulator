import { mutableEmpty } from './array';

export type Topic<E> = {
  [Symbol.iterator](): IterableIterator<E>;
  staged: E[];
  ready: E[];
  isRegistered: boolean;
};

export function emit<T extends Topic<unknown>>(
  topic: T,
  event: T extends Topic<infer E> ? E : never,
  immediate = false
) {
  if (!topic.isRegistered) {
    console.warn('Warning: emitting to unregistered topic', topic, event, immediate);
  }

  if (immediate) {
    return topic.ready.push(event);
  }
  return topic.staged.push(event);
}

export function flush(topic: Topic<unknown>) {
  mutableEmpty(topic.ready);
  const len = topic.staged.length;
  for (let i = len - 1; i >= 0; i--) {
    topic.ready[i] = topic.staged.pop()!;
  }
}

export function clear(topic: Topic<unknown>) {
  mutableEmpty(topic.staged);
  mutableEmpty(topic.ready);
}

/**
 * Create a topic.
 */
export const newTopic = <$Event = unknown>(): Topic<$Event> => {
  const staged: $Event[] = [];
  const ready: $Event[] = [];

  return {
    *[Symbol.iterator]() {
      for (let i = 0; i < ready.length; i++) {
        yield ready[i];
      }
    },
    staged,
    ready,
    isRegistered: false,
  };
};

export const Topic = {
  new: newTopic,
  emit,
  flush,
  clear,
};

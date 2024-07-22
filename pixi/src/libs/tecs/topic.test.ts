import { Topic } from './topic';
import { Essence } from './essence';

type AddedEvent = {
  type: 'added';
  id: number;
};

type RemovedEvent = {
  type: 'removed';
  id: number;
};

type CustomEvent = AddedEvent | RemovedEvent;

describe('topic', () => {
  it('should work', () => {
    expect(1).toBe(1);

    const topic = Topic.new<CustomEvent>();

    Topic.emit(topic, { type: 'added', id: 1 });

    expect([...topic]).toEqual([]);

    Topic.flush(topic);

    expect([...topic]).toEqual([{ type: 'added', id: 1 }]);
  });
  it('sequence', () => {
    const essence = Essence.new();

    const topic = Topic.new<CustomEvent>();

    let seq = 0;

    const SpawnEventSystem = () => {
      Topic.emit(topic, { type: 'added', id: seq });
      Topic.emit(topic, { type: 'removed', id: seq }, true);
    };

    const TopicSystem = () => {
      seq++;
      if (seq === 1) {
        expect(topic.ready).toEqual([{ type: 'removed', id: 0 }]);
        expect(topic.staged).toEqual([{ type: 'added', id: 0 }]);
      } else if (seq === 2) {
        expect(topic.ready).toEqual([
          { type: 'added', id: 0 },
          { type: 'removed', id: 1 },
        ]);
        expect(topic.staged).toEqual([{ type: 'added', id: 1 }]);
      } else {
        throw new Error('unexpected');
      }
    };

    Essence.registerTopic(essence, topic);
    Essence.registerSystem(essence, SpawnEventSystem);
    Essence.registerSystem(essence, TopicSystem);

    Essence.step(essence);

    Essence.step(essence);

    expect(seq).toBe(2);
  });
});

import { Topic } from './topic';
import { World } from './world';

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

    Topic.push(topic, { type: 'added', id: 1 });

    expect([...topic]).toEqual([]);

    Topic.flush(topic);

    expect([...topic]).toEqual([{ type: 'added', id: 1 }]);
  });
  it('sequence', () => {
    const world = World.new();

    const topic = Topic.new<CustomEvent>();

    let seq = 0;

    const SpawnEventSystem = () => {
      Topic.push(topic, { type: 'added', id: seq });
      Topic.push(topic, { type: 'removed', id: seq }, true);
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

    World.registerTopic(world, topic);
    World.registerSystem(world, SpawnEventSystem);
    World.registerSystem(world, TopicSystem);

    World.step(world);

    World.step(world);

    expect(seq).toBe(2);
  });
});

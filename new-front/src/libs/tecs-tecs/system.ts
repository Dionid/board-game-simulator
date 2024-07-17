import { World } from './world';

export type EngineEventType = 'preUpdate' | 'update' | 'postUpdate';

export type EventType = EngineEventType | string;

export type Event = {
  type: EventType;
};

export type Context = {
  event: Event;
  deltaTime: number;
  world: World;
};

export type System = (ctx: Context) => void;

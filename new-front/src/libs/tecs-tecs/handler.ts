import { World } from './world';

export type EventType = string;

export type Event = {
  type: EventType;
};

export type Context = {
  event: Event;
  world: World;
};

export type Handler = (ctx: Context) => void;

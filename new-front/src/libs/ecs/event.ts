import { UUID } from '../branded-types';

export type EventId = string & { readonly EventId: unique symbol };
export const EventId = {
  ofString: (value: string): EventId => {
    return value as EventId;
  },
  new: (): EventId => {
    return EventId.ofString(UUID.new());
  },
};

export type Event<Name extends string, Payload extends Record<any, any> | boolean | string | number | undefined> = {
  name: Name;
  id: EventId;
  payload: Payload;
};

export type EventFactory<
  Name extends string,
  Payload extends Record<any, any> | boolean | string | number | undefined
> = {
  name: Name;
  new: (d: Payload) => Event<Name, Payload>;
};

export const EventFactory = <
  Name extends string,
  Payload extends Record<any, any> | boolean | string | number | undefined
>(
  name: Name
) => {
  return {
    name,
    new: (payload: Payload) => {
      return {
        name,
        id: EventId.new(),
        payload,
      };
    },
  };
};

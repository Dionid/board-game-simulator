import { UUID } from '../branded-types';
export const EventId = {
  ofString: (value) => {
    return value;
  },
  new: () => {
    return EventId.ofString(UUID.new());
  },
};
export const EventFactory = (name) => {
  return {
    name,
    new: (payload, liveFor) => {
      return {
        name,
        id: EventId.new(),
        payload,
        liveFor,
      };
    },
  };
};

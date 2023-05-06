import { UUID } from '../branded-types';
export var EventId = {
  ofString: function (value) {
    return value;
  },
  new: function () {
    return EventId.ofString(UUID.new());
  },
};
export var EventFactory = function (name) {
  return {
    name: name,
    new: function (payload, liveFor) {
      return {
        name: name,
        id: EventId.new(),
        payload: payload,
        liveFor: liveFor,
      };
    },
  };
};

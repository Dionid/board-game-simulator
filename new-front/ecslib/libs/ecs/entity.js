import { UUID } from '../branded-types';
export var EntityId = {
  ofString: function (value) {
    return value;
  },
  new: function () {
    return EntityId.ofString(UUID.new());
  },
};

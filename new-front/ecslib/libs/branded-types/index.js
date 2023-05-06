import { v4, validate } from 'uuid';
export var UUID = {
  ofString: function (value) {
    if (!validate(value)) {
      throw new Error('not valid uuid');
    }
    return value;
  },
  new: function () {
    return UUID.ofString(v4());
  },
};

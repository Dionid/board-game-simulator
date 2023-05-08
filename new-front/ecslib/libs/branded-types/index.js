import { v4, validate } from 'uuid';
export const UUID = {
  ofString: (value) => {
    if (!validate(value)) {
      throw new Error('not valid uuid');
    }
    return value;
  },
  new: () => {
    return UUID.ofString(v4());
  },
};

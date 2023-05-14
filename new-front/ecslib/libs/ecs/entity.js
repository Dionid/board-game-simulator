import { UUID } from '../branded-types';
export const EntityId = {
  ofString: (value) => {
    return value;
  },
  new: () => {
    return EntityId.ofString(UUID.new());
  },
};

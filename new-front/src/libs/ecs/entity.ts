import { UUID } from '../branded-types';

export type EntityId = string & { readonly EntityId: unique symbol };
export const EntityId = {
  ofString: (value: string): EntityId => {
    return value as EntityId;
  },
  new: (): EntityId => {
    return EntityId.ofString(UUID.new());
  },
};

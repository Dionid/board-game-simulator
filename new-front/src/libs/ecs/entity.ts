import { UUID } from '../branded-types';

export type EntityId = UUID & { readonly EntityId: unique symbol };
export const EntityId = {
  ofString: (value: string): EntityId => {
    return UUID.ofString(value) as EntityId;
  },
  new: (): EntityId => {
    return EntityId.ofString(UUID.new());
  },
};

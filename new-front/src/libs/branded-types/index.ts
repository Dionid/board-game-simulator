import { v4, validate } from 'uuid';

export type UUID = string & { readonly UUID: unique symbol };
export const UUID = {
  ofString: (value: string) => {
    if (!validate(value)) {
      throw new Error('not valid uuid');
    }
    return value as UUID;
  },
  new: () => {
    return UUID.ofString(v4()) as UUID;
  },
};

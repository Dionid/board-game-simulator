type Stringify<T> = T extends number ? `${T}` : T;

export const TypedObject = {
  keys: <T extends string | number | symbol>(val: Record<T, any>): Stringify<T>[] => {
    return Object.keys(val) as Stringify<T>[];
  },
  entries: <T extends string | number | symbol, V>(val: Record<T, V>): [Stringify<T>, V][] => {
    return Object.entries(val) as [Stringify<T>, V][];
  },
};

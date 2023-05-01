import { createEffect } from '.';

export type UseRefEffectApi<V> = {
  current: V;
};

export const useRef = createEffect((world) => {
  let initial = true;

  const ref: UseRefEffectApi<unknown> = {
    current: null,
  };

  return function useRef<Value>(initialValue: Value) {
    if (initial) {
      ref.current = initialValue;
      initial = false;
    }

    return ref;
  };
});

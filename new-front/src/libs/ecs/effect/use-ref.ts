import { createEffect } from '../effect';
import { useIsInitial } from './use-init';

export type UseRefEffectApi<V> = {
  current: V;
};

export const useRef = createEffect((world) => {
  const ref: UseRefEffectApi<unknown> = {
    current: null,
  };

  return function useRef<Value>(initialValue: Value): UseRefEffectApi<Value> {
    const initial = useIsInitial();

    if (initial) {
      ref.current = initialValue;
    }

    return ref as UseRefEffectApi<Value>;
  };
});

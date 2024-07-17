import { createHook } from '../hook';
import { useIsInitial } from './use-init';

export type UseRefHookApi<V> = {
  current: V;
};

export const useRef = createHook((world) => {
  const ref: UseRefHookApi<unknown> = {
    current: null,
  };

  return function useRef<Value>(initialValue: Value): UseRefHookApi<Value> {
    const initial = useIsInitial();

    if (initial) {
      ref.current = initialValue;
    }

    return ref as UseRefHookApi<Value>;
  };
});

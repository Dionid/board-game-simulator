import { createHook } from '../hook';
import { UseRefHookApi, useRef } from './use-ref';

export const useSharedRef = createHook(
  () => {
    return function useSharedRef<Value>(initialValue: Value): UseRefHookApi<Value> {
      return useRef(initialValue);
    };
  },
  {
    singletonPerStep: true,
  }
);

import { createHook } from '../hook';
import { useRef } from './use-ref';
export const useSharedRef = createHook(
  () => {
    return function useSharedRef(initialValue) {
      return useRef(initialValue);
    };
  },
  {
    singletonPerStep: true,
  }
);

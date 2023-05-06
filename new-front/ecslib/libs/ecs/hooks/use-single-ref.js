import { createHook } from '../hook';
import { useRef } from './use-ref';
export var useSharedRef = createHook(
  function () {
    return function useSharedRef(initialValue) {
      return useRef(initialValue);
    };
  },
  {
    singletonPerStep: true,
  }
);

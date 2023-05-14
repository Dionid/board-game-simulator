import { createHook } from '../hook';
import { useIsInitial } from './use-init';
export const useRef = createHook((world) => {
  const ref = {
    current: null,
  };
  return function useRef(initialValue) {
    const initial = useIsInitial();
    if (initial) {
      ref.current = initialValue;
    }
    return ref;
  };
});

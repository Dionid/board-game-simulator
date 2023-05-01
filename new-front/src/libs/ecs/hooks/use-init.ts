import { createHook } from '../hook';

export const useIsInitial = createHook(() => {
  let initial = true;

  return function useInit() {
    if (initial) {
      initial = false;
      return true;
    }

    return false;
  };
});

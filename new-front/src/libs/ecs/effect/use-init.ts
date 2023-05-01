import { createEffect } from '../effect';

export const useIsInitial = createEffect(() => {
  let initial = true;

  return function useInit() {
    if (initial) {
      initial = false;
      return true;
    }

    return false;
  };
});

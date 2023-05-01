import { createEffect } from '../effect';

export const useStepTimeDelta = createEffect(
  () => {
    let lastTime: number = Date.now();
    let timeDelta = 0;

    return function useStepTimeDelta() {
      const now = Date.now();
      timeDelta = now - lastTime;
      lastTime = now;

      return timeDelta;
    };
  },
  {
    shared: true,
  }
);

import { createHook } from '../hook';

export const useStepTimeDelta = createHook(
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
    singletonPerStep: true,
  }
);

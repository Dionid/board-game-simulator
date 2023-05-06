import { createHook } from '../hook';
export var useStepTimeDelta = createHook(
  function () {
    var lastTime = Date.now();
    var timeDelta = 0;
    return function useStepTimeDelta() {
      var now = Date.now();
      timeDelta = now - lastTime;
      lastTime = now;
      return timeDelta;
    };
  },
  {
    singletonPerStep: true,
  }
);

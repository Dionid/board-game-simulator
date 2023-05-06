import { createHook } from '../hook';
export var useIsInitial = createHook(function () {
  var initial = true;
  return function useInit() {
    if (initial) {
      initial = false;
      return true;
    }
    return false;
  };
});

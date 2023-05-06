import { createHook } from '../hook';
import { useIsInitial } from './use-init';
export var useRef = createHook(function (world) {
  var ref = {
    current: null,
  };
  return function useRef(initialValue) {
    var initial = useIsInitial();
    if (initial) {
      ref.current = initialValue;
    }
    return ref;
  };
});

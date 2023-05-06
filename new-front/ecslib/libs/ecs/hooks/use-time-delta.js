import { useRef } from './use-ref';
export var useTimeDelta = function () {
  var now = Date.now();
  var lastTime = useRef(now);
  var timeDelta = now - lastTime.current;
  lastTime.current = now;
  return timeDelta;
};

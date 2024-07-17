import { useRef } from './use-ref';

export const useTimeDelta = () => {
  const now = Date.now();
  const lastTime = useRef(now);
  const timeDelta = now - lastTime.current;
  lastTime.current = now;
  return timeDelta;
};

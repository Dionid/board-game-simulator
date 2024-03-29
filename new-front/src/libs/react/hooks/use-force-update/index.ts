import { useReducer } from 'react';

export const useForceUpdate = (): [string, () => void] => {
  const [forceUpdateState, forceUpdate] = useReducer((c) => c + 1, 0);

  return [forceUpdateState, () => forceUpdate()];
};

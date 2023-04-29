import { useState } from 'react';
import { v4 } from 'uuid';

export const useForceUpdate = (): [string, () => void] => {
  const [forceUpdateState, forceUpdate] = useState<string>(v4());

  return [forceUpdateState, () => forceUpdate(v4())];
};

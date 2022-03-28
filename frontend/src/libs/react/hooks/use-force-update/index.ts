import { useState } from 'react';
import { v4 } from 'uuid';

export const useForceUpdate = () => {
  const [, forceUpdate] = useState<string>(v4());

  return () => forceUpdate(v4());
};

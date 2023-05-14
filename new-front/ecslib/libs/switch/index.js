export const safeGuard = (arg) => {
  throw new Error(`Not all cases been captured in switch ${arg}`);
};
export const Switch = {
  safeGuard,
};

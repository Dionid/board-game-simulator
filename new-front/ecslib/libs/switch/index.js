export var safeGuard = function (arg) {
  throw new Error('Not all cases been captured in switch '.concat(arg));
};
export var Switch = {
  safeGuard: safeGuard,
};

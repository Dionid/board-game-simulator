var __read =
  (this && this.__read) ||
  function (o, n) {
    var m = typeof Symbol === 'function' && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
      r,
      ar = [],
      e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error: error };
    } finally {
      try {
        if (r && !r.done && (m = i['return'])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
import { useReducer } from 'react';
export var useForceUpdate = function () {
  var _a = __read(
      useReducer(function (c) {
        return c + 1;
      }, 0),
      2
    ),
    forceUpdateState = _a[0],
    forceUpdate = _a[1];
  return [
    forceUpdateState,
    function () {
      return forceUpdate();
    },
  ];
};

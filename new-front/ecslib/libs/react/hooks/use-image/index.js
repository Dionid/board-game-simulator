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
import { useLayoutEffect, useRef, useState } from 'react';
export var useImage = function (url, crossOrigin) {
  // lets use refs for image and status
  // so we can update them during render
  // to have instant update in status/image when new data comes in
  var statusRef = useRef('loading');
  var imageRef = useRef();
  // we are not going to use token
  // but we need to just to trigger state update
  var _a = __read(useState(0), 2),
    setStateToken = _a[1];
  // keep track of old props to trigger changes
  var oldUrl = useRef();
  var oldCrossOrigin = useRef();
  if (oldUrl.current !== url || oldCrossOrigin.current !== crossOrigin) {
    statusRef.current = 'loading';
    imageRef.current = undefined;
    oldUrl.current = url;
    oldCrossOrigin.current = crossOrigin;
  }
  useLayoutEffect(
    function () {
      if (!url) return;
      var img = document.createElement('img');
      function onload() {
        statusRef.current = 'loaded';
        imageRef.current = img;
        setStateToken(Math.random());
      }
      function onerror() {
        statusRef.current = 'failed';
        imageRef.current = undefined;
        setStateToken(Math.random());
      }
      img.addEventListener('load', onload);
      img.addEventListener('error', onerror);
      crossOrigin && (img.crossOrigin = crossOrigin);
      img.src = url;
      return function cleanup() {
        img.removeEventListener('load', onload);
        img.removeEventListener('error', onerror);
      };
    },
    [url, crossOrigin]
  );
  // return array because it it better to use in case of several useImage hooks
  // const [background, backgroundStatus] = useImage(url1);
  // const [patter] = useImage(url2);
  return [imageRef.current, statusRef.current];
};

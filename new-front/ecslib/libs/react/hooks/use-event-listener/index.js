import { useEffect, useRef } from 'react';
export var useEventListener = function (eventName, handler, element) {
  if (element === void 0) {
    element = window;
  }
  // Create a ref that stores handler
  var savedHandler = useRef(handler);
  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  useEffect(
    function () {
      savedHandler.current = handler;
    },
    [handler]
  );
  useEffect(
    function () {
      // Make sure element supports addEventListener
      // On
      var isSupported = element && element.addEventListener;
      if (!isSupported) return;
      // Create event listener that calls handler function stored in ref
      var eventListener = function (event) {
        return savedHandler.current(event);
      };
      // Add event listener
      element.addEventListener(eventName, eventListener);
      // Remove event listener on cleanup
      return function () {
        element.removeEventListener(eventName, eventListener);
      };
    },
    [eventName, element] // Re-run if eventName or element changes
  );
};

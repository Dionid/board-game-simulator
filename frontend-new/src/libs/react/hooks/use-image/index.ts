import { useLayoutEffect, useRef, useState } from 'react';

export type ImageStatus = 'loaded' | 'loading' | 'failed';

export const useImage = (
  url: string,
  crossOrigin?: 'anonymous' | 'use-credentials'
): [undefined | HTMLImageElement, ImageStatus] => {
  // lets use refs for image and status
  // so we can update them during render
  // to have instant update in status/image when new data comes in
  const statusRef = useRef<ImageStatus>('loading');
  const imageRef = useRef<HTMLImageElement>();

  // we are not going to use token
  // but we need to just to trigger state update
  const [, setStateToken] = useState(0);

  // keep track of old props to trigger changes
  const oldUrl = useRef<string>();
  const oldCrossOrigin = useRef<string>();
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

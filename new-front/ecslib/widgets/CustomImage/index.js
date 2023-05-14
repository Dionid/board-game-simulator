import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import React, { Fragment } from 'react';
import { Image, Transformer } from 'react-konva';
import { useImage } from '../../libs/react/hooks/use-image';
export const CustomImage = (props) => {
  const { url, isSelected, onSelect } = props;
  const [image] = useImage(url);
  const shapeRef = React.useRef(null);
  const trRef = React.useRef(null);
  React.useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      if (shapeRef.current) {
        trRef.current?.nodes([shapeRef.current]);
        trRef.current?.getLayer()?.batchDraw();
      }
    }
  }, [isSelected]);
  return _jsxs(Fragment, {
    children: [
      _jsx(Image, { ...props, ref: shapeRef, onClick: onSelect, onTap: onSelect, image: image }),
      isSelected &&
        _jsx(Transformer, {
          ref: trRef,
          boundBoxFunc: (oldBox, newBox) => {
            // limit resize
            if (newBox.width < 100 || newBox.height < 100) {
              return oldBox;
            }
            return newBox;
          },
        }),
    ],
  });
};

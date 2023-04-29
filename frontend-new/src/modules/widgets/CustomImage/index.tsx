import Konva from 'konva';
import { useImage } from '../../../libs/react/hooks/use-image';
import React, { Fragment } from 'react';
import { Image, Transformer } from 'react-konva';
import { KonvaNodeEvents } from 'react-konva/ReactKonvaCore';

export const CustomImage = (
  props: { url: string; isSelected: boolean; onSelect: () => void } & KonvaNodeEvents & Omit<Konva.ImageConfig, 'image'>
) => {
  const { url, isSelected, onSelect } = props;

  const [image] = useImage(url);

  const shapeRef = React.useRef<Konva.Image | null>(null);
  const trRef = React.useRef<Konva.Transformer | null>(null);

  React.useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      if (shapeRef.current) {
        trRef.current?.nodes([shapeRef.current]);
        trRef.current?.getLayer()?.batchDraw();
      }
    }
  }, [isSelected]);

  return (
    <Fragment>
      <Image {...props} ref={shapeRef} onClick={onSelect} onTap={onSelect} image={image} />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 100 || newBox.height < 100) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </Fragment>
  );
};

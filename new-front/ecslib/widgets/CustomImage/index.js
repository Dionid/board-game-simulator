var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import React, { Fragment } from 'react';
import { Image, Transformer } from 'react-konva';
import { useImage } from '../../libs/react/hooks/use-image';
export var CustomImage = function (props) {
  var url = props.url,
    isSelected = props.isSelected,
    onSelect = props.onSelect;
  var _a = __read(useImage(url), 1),
    image = _a[0];
  var shapeRef = React.useRef(null);
  var trRef = React.useRef(null);
  React.useEffect(
    function () {
      var _a, _b, _c;
      if (isSelected) {
        // we need to attach transformer manually
        if (shapeRef.current) {
          (_a = trRef.current) === null || _a === void 0 ? void 0 : _a.nodes([shapeRef.current]);
          (_c = (_b = trRef.current) === null || _b === void 0 ? void 0 : _b.getLayer()) === null || _c === void 0
            ? void 0
            : _c.batchDraw();
        }
      }
    },
    [isSelected]
  );
  return _jsxs(Fragment, {
    children: [
      _jsx(Image, __assign({}, props, { ref: shapeRef, onClick: onSelect, onTap: onSelect, image: image })),
      isSelected &&
        _jsx(Transformer, {
          ref: trRef,
          boundBoxFunc: function (oldBox, newBox) {
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

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
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
import { memo, useState } from 'react';
import { Box, IconButton, ListItemIcon, MenuItem, Tooltip } from '@mui/material';
import Menu from '@mui/material/Menu';
import { PersonAdd } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import PanToolIcon from '@mui/icons-material/PanTool';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { Essence } from '../../libs/ecs/essence';
import { PanModeComponent } from '../../libs/bgs/ecs/components';
import { Pool } from '../../libs/ecs/component';
import { useEventListener } from '../../libs/react/hooks/use-event-listener';
import { ZoomInEvent, ZoomOutEvent } from '../../libs/bgs/ecs/events';
export var MainMenu = memo(function (_a) {
  var world = _a.world,
    playerEntity = _a.playerEntity;
  var _b = __read(useState(null), 2),
    mode = _b[0],
    setMode = _b[1];
  var _c = __read(useState(null), 2),
    anchorEl = _c[0],
    setAnchorEl = _c[1];
  var open = Boolean(anchorEl);
  var handleMenuButtonClick = function (event) {
    setAnchorEl(event.currentTarget);
  };
  var handleMenuClose = function () {
    setAnchorEl(null);
  };
  var handlePanIconButtonClick = function () {
    var panModeCP = Essence.getOrAddPool(world.essence, PanModeComponent);
    var panMode = Pool.get(panModeCP, playerEntity);
    if (mode === 'pan') {
      setMode(null);
      panMode.activated = false;
    } else {
      setMode('pan');
      panMode.activated = true;
    }
  };
  var handler = function (_a) {
    var key = _a.key;
    if (key === 'p') {
      handlePanIconButtonClick();
    }
  };
  useEventListener('keydown', handler);
  var onZoomOutClick = function () {
    Essence.addEvent(world.essence, ZoomOutEvent.new(undefined));
  };
  var onZoomInClick = function () {
    Essence.addEvent(world.essence, ZoomInEvent.new(undefined));
  };
  return _jsxs(_Fragment, {
    children: [
      _jsxs(
        Box,
        __assign(
          {
            sx: {
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center',
              position: 'fixed',
              bottom: 15,
              right: 15,
            },
          },
          {
            children: [
              _jsx(
                Tooltip,
                __assign(
                  { title: 'Zoom out' },
                  {
                    children: _jsx(
                      IconButton,
                      __assign(
                        { size: 'large', onClick: onZoomOutClick, sx: { ml: 2, backgroundColor: '#bdbdbd' } },
                        { children: _jsx(ZoomOutIcon, {}) }
                      )
                    ),
                  }
                )
              ),
              _jsx(
                Tooltip,
                __assign(
                  { title: 'Zoom in' },
                  {
                    children: _jsx(
                      IconButton,
                      __assign(
                        { size: 'large', onClick: onZoomInClick, sx: { ml: 2, backgroundColor: '#bdbdbd' } },
                        { children: _jsx(ZoomInIcon, {}) }
                      )
                    ),
                  }
                )
              ),
              _jsx(
                Tooltip,
                __assign(
                  { title: 'Pan mode' },
                  {
                    children: _jsx(
                      IconButton,
                      __assign(
                        {
                          size: 'large',
                          onClick: handlePanIconButtonClick,
                          sx: { ml: 2, backgroundColor: mode === 'pan' ? '#b388da' : '#bdbdbd' },
                        },
                        { children: _jsx(PanToolIcon, {}) }
                      )
                    ),
                  }
                )
              ),
              _jsx(
                Tooltip,
                __assign(
                  { title: 'Main menu' },
                  {
                    children: _jsx(
                      IconButton,
                      __assign(
                        {
                          onClick: handleMenuButtonClick,
                          size: 'large',
                          sx: { ml: 2, backgroundColor: '#bdbdbd' },
                          'aria-controls': open ? 'account-menu' : undefined,
                          'aria-haspopup': 'true',
                          'aria-expanded': open ? 'true' : undefined,
                        },
                        { children: _jsx(AddIcon, {}) }
                      )
                    ),
                  }
                )
              ),
            ],
          }
        )
      ),
      _jsx(
        Menu,
        __assign(
          {
            anchorEl: anchorEl,
            id: 'account-menu',
            open: open,
            onClose: handleMenuClose,
            PaperProps: {
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
              },
            },
            transformOrigin: { horizontal: 'right', vertical: 'bottom' },
            anchorOrigin: { horizontal: 'left', vertical: 'top' },
          },
          {
            children: _jsxs(MenuItem, {
              children: [_jsx(ListItemIcon, { children: _jsx(PersonAdd, { fontSize: 'small' }) }), 'No actions'],
            }),
          }
        )
      ),
    ],
  });
});

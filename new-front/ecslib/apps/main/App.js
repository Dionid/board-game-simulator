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
import { useEffect, useMemo, useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { World } from '../../libs/ecs/world';
import { FingerInputSystem } from '../../libs/bgs/ecs/systems/finger-input';
import { PlayerSystem } from '../../libs/bgs/ecs/systems/player';
import { CameraSystem } from '../../libs/bgs/ecs/systems/camera';
import { Minimap } from '../../widgets/Minimap';
import { essence, initStore } from './store';
import { MainMenu } from '../../widgets/MainMenu';
import { EntityId } from '../../libs/ecs/entity';
import { ZoomSystem } from '../../libs/bgs/ecs/systems/zoom';
import { v4 } from 'uuid';
import { ContextMenu } from '../../widgets/ContextMenu';
import { Board } from '../../widgets/Board';
import { CreateBGCGameObjectEventSystem } from '../../libs/bgs/ecs/systems/create-bgs-game-object-event';
import { DepthSystem } from '../../libs/bgs/ecs/systems/depth';
var getOrSetPlayerId = function () {
  var key = 'bgs_player_id';
  var params = new URLSearchParams(window.location.search);
  if (params.has(key)) {
    return EntityId.ofString(params.get(key));
  }
  var playerId = localStorage.getItem(key);
  if (!playerId) {
    // localStorage.setItem(key, 'e33e6255-face-4402-a927-87cbb696c413');
    localStorage.setItem(key, v4());
    return getOrSetPlayerId();
  }
  return EntityId.ofString(playerId);
};
// TODO. Move
var boardSize = {
  width: 5000,
  height: 3000,
};
var GameStage = function () {
  var playerEntity = useMemo(function () {
    return getOrSetPlayerId();
  }, []);
  console.log('playerEntity', playerEntity);
  var world = useMemo(function () {
    console.log('FIRST RUN');
    // @ts-ignore
    if (window.world) {
      console.log('WORLD EXIST');
      // @ts-ignore
      return window.world;
    }
    var world = World.new({
      essence: essence,
      ctx: function () {
        return {
          playerEntity: playerEntity,
          cameraEntity: playerEntity,
          boardSize: boardSize,
        };
      },
      systems: [
        // # INIT
        PlayerSystem(),
        // # CAMERA
        CameraSystem(),
        ZoomSystem(),
        // # INPUT
        FingerInputSystem(),
        // INTERACTION
        // SelectSystem(),
        // DragSystem(),
        // DepthSystem(),
        // # SPAWN
        DepthSystem(),
        CreateBGCGameObjectEventSystem(),
        // SpawnGameMapSystem(),
        // SpawnHeroSetSystem(),
        // SpawnHeroSystem(),
        // SpawnSidekickEventSystem(),
        // SpawnDeckEventSystem(),
        // SpawnCardEventSystem(),
        // SpawnRuleCardEventSystem(),
        // SpawnHealthMeterEventSystem(),
        // DeleteHeroEventSet(),
        // TakeCardFromDeckEventSystem(),
        // Flip(),
        // ChangeView(),
        // IncDecHealthMeterEvent(),
        // // SPAWN GAME OBJECT
        // SpawnGameObjectSystem(),
      ],
    });
    // @ts-ignore
    window.world = world;
    var run = function () {
      World.run(world);
      requestAnimationFrame(run);
    };
    run();
    console.log('AFTER INIT', world);
    return world;
  }, []);
  return _jsxs(
    'div',
    __assign(
      { style: { width: '100vw', height: '100vh', backgroundColor: '#eee' } },
      {
        children: [
          _jsx(CssBaseline, {}),
          _jsx(
            ContextMenu,
            __assign(
              { world: world, cameraEntity: playerEntity, playerEntity: playerEntity },
              { children: _jsx(Board, { cameraEntity: playerEntity }) }
            )
          ),
          _jsx(MainMenu, { playerEntity: playerEntity, world: world }),
          _jsx(Minimap, { playerEntity: playerEntity, boardSize: boardSize }),
        ],
      }
    )
  );
};
function App() {
  var _a = __read(useState(false), 2),
    loaded = _a[0],
    setLoaded = _a[1];
  useEffect(function () {
    // @ts-ignore
    if (window.world) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var paramsRoomId = params.get('room-id');
    var roomId = paramsRoomId ? paramsRoomId : '91dd64b2-a908-4562-b6e2-eacb86548da0';
    var provider = initStore(roomId);
    var int = setInterval(function () {
      if (provider.connected) {
        clearInterval(int);
        setLoaded(true);
      }
    }, 100);
  }, []);
  if (!loaded) {
    return _jsx('div', { children: 'Loading...' });
  }
  return _jsx(GameStage, {});
}
export default App;

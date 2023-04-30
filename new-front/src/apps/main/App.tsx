import { useEffect, useMemo, useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { BgsWorld } from '../../libs/bgs/ecs';
import { World } from '../../libs/ecs/world';
import { Essence } from '../../libs/ecs/essence';
import { FingerInputSystem } from '../../libs/bgs/ecs/systems/finger-input';
import { PlayerSystem } from '../../libs/bgs/ecs/systems/player';
import { HeroSets } from '../../libs/bgs/games/unmatched';
import { CameraSystem } from '../../libs/bgs/ecs/systems/camera';
import { Minimap } from '../../widgets/Minimap';
import { essence, initStore } from './store';
import { MainMenu } from '../../widgets/MainMenu';
import { EntityId } from '../../libs/ecs/entity';
import { ZoomSystem } from '../../libs/bgs/ecs/systems/zoom';
import { v4 } from 'uuid';

const getOrSetPlayerId = (): EntityId => {
  const key = 'bgs_player_id';

  const params = new URLSearchParams(window.location.search);

  if (params.has(key)) {
    return EntityId.ofString(params.get(key)!);
  }

  const playerId = localStorage.getItem(key);
  if (!playerId) {
    // localStorage.setItem(key, 'e33e6255-face-4402-a927-87cbb696c413');
    localStorage.setItem(key, v4());
    return getOrSetPlayerId();
  }
  return EntityId.ofString(playerId);
};

// TODO. Move
const boardSize = {
  width: 5000,
  height: 3000,
};

const GameStage = () => {
  const playerEntity = useMemo(() => {
    return getOrSetPlayerId();
  }, []);

  console.log('playerEntity', playerEntity);

  const world = useMemo(() => {
    console.log('FIRST RUN');

    // @ts-ignore
    if (window.world) {
      console.log('WORLD EXIST');
      // @ts-ignore
      return window.world;
    }

    const world: BgsWorld = {
      essence: essence,
      ctx: {
        playerEntity: playerEntity,
        cameraEntity: playerEntity,
        heroSets: HeroSets,
        boardSize,
      },
      systems: [
        // INIT
        PlayerSystem(),

        // CAMERA
        CameraSystem(),
        ZoomSystem(),

        // INPUT
        FingerInputSystem(),

        // INTERACTION
        // SelectSystem(),
        // DragSystem(),
        // DepthSystem(),

        // // SPAWN
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
    };

    // @ts-ignore
    window.world = world;
    // @ts-ignore
    window.World = World;
    // @ts-ignore
    window.Essence = Essence;

    World.init(world);

    console.log('AFTER INIT', world);

    let lastTimeStamp = new Date();

    const run = async () => {
      const newTimeStamp = new Date();
      const timeDelta = newTimeStamp.getMilliseconds() - lastTimeStamp.getMilliseconds();
      World.run(world, timeDelta < 0 ? 0 : timeDelta);
      lastTimeStamp = newTimeStamp;
      requestAnimationFrame(run);
    };

    requestAnimationFrame(run);

    return world;
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#eee' }}>
      <CssBaseline />
      {/* <ContextMenu world={world} heroSets={heroSets}>
        {playerEntity && <GameStage forceUpdateState={forceUpdateState} world={world} playerEntity={playerEntity} />}
      </ContextMenu> */}
      <MainMenu playerEntity={playerEntity} world={world} />
      <Minimap playerEntity={playerEntity} world={world} boardSize={boardSize} />
    </div>
  );
};

function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // @ts-ignore
    if (window.world) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const paramsRoomId = params.get('room-id');
    const roomId = paramsRoomId ? paramsRoomId : '91dd64b2-a908-4562-b6e2-eacb86548da0';
    const provider = initStore(roomId);
    const int = setInterval(() => {
      if (provider.connected) {
        clearInterval(int);
        setLoaded(true);
      }
    }, 100);
  }, []);

  if (!loaded) {
    return <div>Loading...</div>;
  }

  return <GameStage />;
}

export default App;

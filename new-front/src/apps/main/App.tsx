import { useMemo } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { BgsWorld, BgsWorldCtx } from '../../libs/bgs/ecs';
import { World } from '../../libs/ecs/world';
import { Essence } from '../../libs/ecs/essence';
import { FingerInputSystem } from '../../libs/bgs/ecs/systems/mouse-input';
import { PlayerSystem } from '../../libs/bgs/ecs/systems/player';
import { HeroSets } from '../../libs/bgs/games/unmatched';
import { CameraSystem } from '../../libs/bgs/ecs/systems/camera';
import { UUID } from '../../libs/branded-types';
// import {YjsSyncedStoreSystem, YjsSyncedStoreToECSSystem} from "../../libs/bgs/ecs/systems/yjs-synced-store";

const getOrSetPlayerId = (): UUID => {
  const key = 'bgs_player_id';
  const playerId = localStorage.getItem(key);
  if (!playerId) {
    localStorage.setItem(key, 'e33e6255-face-4402-a927-87cbb696c413');
    return getOrSetPlayerId();
  }
  return UUID.ofString(playerId);
};

// TODO. Move
const boardSize = {
  width: 5000,
  height: 3000,
};

function App() {
  // const [forceUpdateState, forceUpdate] = useForceUpdate();
  // const [heroSets] = useState(HeroSets);

  const world = useMemo(() => {
    const world: BgsWorld = {
      essence: {
        pools: {},
      },
      ctx: {
        playerId: getOrSetPlayerId(),
        heroSets: HeroSets,
        boardSize,
      },
      systems: [
        // YjsSyncedStoreToECSSystem(),

        // INIT
        PlayerSystem(),

        // CAMERA
        // BoardSystem(boardSize),
        CameraSystem(),
        // ZoomSystem(),

        // INPUT
        FingerInputSystem(),

        // // INTERACTION
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

        // // RENDER REACT
        // ChangeReactPositionSystem(),
        // ChangeReactImageSystem(),
        // ChangeReactSizeSystem(),
        // ChangeReactScaleSystem(),
        // ChangeReactHealthMeter(),
      ],
    };

    // @ts-ignore
    window.world = world;
    // @ts-ignore
    window.World = World;
    // @ts-ignore
    window.Essence = Essence;

    World.init(world);

    console.log("AFTER INIT", world)

    let lastTimeStamp = new Date();

    const run = async () => {
      const newTimeStamp = new Date();
      const timeDelta = newTimeStamp.getMilliseconds() - lastTimeStamp.getMilliseconds();
      World.run(world, timeDelta < 0 ? 0 : timeDelta);
      lastTimeStamp = newTimeStamp;
      console.log("AFTER RUN", world)
      requestAnimationFrame(run);
    };

    requestAnimationFrame(run);

    return world;
  }, []);

  // useEffect(() => {
  //   World.addToCtx(world, 'heroSets', heroSets);
  // }, [heroSets]);

  // TODO. Refactor for collaboration
  // const playerEntities = Essence.filter(world.essence, [PlayerComponentName, CameraComponentName]);
  // const playerEntity = playerEntities[0];

  return (
    <div>
      <CssBaseline />
      {/* <ContextMenu world={world} heroSets={heroSets}>
        {playerEntity && <GameStage forceUpdateState={forceUpdateState} world={world} playerEntity={playerEntity} />}
      </ContextMenu> */}
      {/* <MainMenu world={world} /> */}
      {/* <Minimap world={world} boardSize={boardSize} playerEntity={playerEntity} /> */}
    </div>
  );
}

export default App;

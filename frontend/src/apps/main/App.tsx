import React, { useEffect, useMemo, useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { BgsWorld, BgsWorldCtx } from '../../libs/bgs/ecs';
import { World } from '../../libs/ecs/world';
import { Essence } from '../../libs/ecs/essence';
import { ChangeReactPositionSystem } from '../../libs/bgs/ecs/systems/change-react-position-system';
import { ChangeReactImageSystem } from '../../libs/bgs/ecs/systems/change-react-image-system';
import { SpawnGameMapSystem } from '../../libs/bgs/ecs/systems/spawn-game-map-system';
import { ChangeReactSizeSystem } from '../../libs/bgs/ecs/systems/change-react-size';
import { SpawnHeroSystem } from '../../libs/bgs/ecs/systems/spawn-hero-system';
import { HandInputSystem } from '../../libs/bgs/ecs/systems/mouse-input';
import { PlayerSystem } from '../../libs/bgs/ecs/systems/player';
import { DragSystem } from '../../libs/bgs/ecs/systems/drag';
import { SelectSystem } from '../../libs/bgs/ecs/systems/select';
import { HeroSets } from '../../libs/bgs/games/unmatched';
import { SpawnHeroSetSystem } from '../../libs/bgs/ecs/systems/spawn-hero-set-system';
import { SpawnGameObjectSystem } from '../../libs/bgs/ecs/systems/spawn-game-object';
import { SpawnSidekickEventSystem } from '../../libs/bgs/ecs/systems/spawn-sidekick-system';
import { SpawnDeckEventSystem } from '../../libs/bgs/ecs/systems/spawn-deck-system';
import { SpawnCardEventSystem } from '../../libs/bgs/ecs/systems/spawn-card-system';
import { SpawnHealthMeterEventSystem } from '../../libs/bgs/ecs/systems/spawn-health-meter-system';
import { SpawnRuleCardEventSystem } from '../../libs/bgs/ecs/systems/spawn-rule-card-system';
import { MainMenu } from '../../modules/widgets/MainMenu';
import { ContextMenu } from '../../modules/widgets/ContextMenu';
import { CameraSystem } from '../../libs/bgs/ecs/systems/camera';
import { BoardSystem } from '../../libs/bgs/ecs/systems/board';
import { useForceUpdate } from '../../libs/react/hooks/use-force-update';
import { Minimap } from '../../modules/widgets/Minimap';
import { GameStage } from '../../modules/widgets/GameStage';
import { ChangeReactScaleSystem } from '../../libs/bgs/ecs/systems/change-react-scale-system';
import { ZoomSystem } from '../../libs/bgs/ecs/systems/zoom';
import { TakeCardFromDeckEventSystem } from '../../libs/bgs/ecs/systems/take-card-from-deck-event';
import { Flip } from '../../libs/bgs/ecs/systems/flip';
import { ChangeView } from '../../libs/bgs/ecs/systems/change-view';
import { DeleteHeroEventSet } from '../../libs/bgs/ecs/systems/delete-hero-set-event';
import { IncDecHealthMeterEvent } from '../../libs/bgs/ecs/systems/inc-dec-health-meter-event';
import { ChangeReactHealthMeter } from '../../libs/bgs/ecs/systems/change-react-health-meter';

// TODO. Move
const boardSize = {
  width: 5000,
  height: 3000,
};
function App() {
  const [forceUpdateState, forceUpdate] = useForceUpdate();
  const [heroSets] = useState(HeroSets);

  const world = useMemo(() => {
    const world: BgsWorld = {
      essence: {
        pools: {},
      },
      ctx: {
        forceUpdate,
      } as BgsWorldCtx,
      systems: [
        // INIT
        PlayerSystem(),

        // INPUT
        HandInputSystem(),

        // CAMERA
        BoardSystem(boardSize),
        CameraSystem(),
        ZoomSystem(),

        // INTERACTION
        SelectSystem(),
        DragSystem(),

        // SPAWN
        SpawnGameMapSystem(),
        SpawnHeroSetSystem(),
        SpawnHeroSystem(),
        SpawnSidekickEventSystem(),
        SpawnDeckEventSystem(),
        SpawnCardEventSystem(),
        SpawnRuleCardEventSystem(),
        SpawnHealthMeterEventSystem(),
        DeleteHeroEventSet(),

        TakeCardFromDeckEventSystem(),
        Flip(),
        ChangeView(),
        IncDecHealthMeterEvent(),

        // SPAWN GAME OBJECT
        SpawnGameObjectSystem(),

        // SPAWN REACT GAME OBJECT
        // ...

        // RENDER REACT
        ChangeReactPositionSystem(),
        ChangeReactImageSystem(),
        ChangeReactSizeSystem(),
        ChangeReactScaleSystem(),
        ChangeReactHealthMeter(),
      ],
    };

    // @ts-ignore
    window.world = world;
    // @ts-ignore
    window.World = World;
    // @ts-ignore
    window.Essence = Essence;

    (async () => {
      await World.init(world);
      forceUpdate();

      let lastTimeStamp = new Date();
      const run = async () => {
        const newTimeStamp = new Date();
        const timeDelta = newTimeStamp.getMilliseconds() - lastTimeStamp.getMilliseconds();
        await World.run(world, timeDelta < 0 ? 0 : timeDelta);
        lastTimeStamp = newTimeStamp;
        requestAnimationFrame(run);
      };

      requestAnimationFrame(run);
    })();

    return world;
  }, []);

  useEffect(() => {
    World.addToCtx(world, 'heroSets', heroSets);
  }, [heroSets]);

  // TODO. Refactor for collaboration
  const playerEntities = Essence.filter(world.essence, ['PlayerComponent', 'CameraComponent']);
  const playerEntity = playerEntities[0];

  return (
    <div>
      <CssBaseline />
      <ContextMenu world={world} heroSets={heroSets}>
        {playerEntity && <GameStage forceUpdateState={forceUpdateState} world={world} playerEntity={playerEntity} />}
      </ContextMenu>
      <MainMenu world={world} />
      {playerEntity && (
        <Minimap forceUpdateState={forceUpdateState} world={world} boardSize={boardSize} playerEntity={playerEntity} />
      )}
    </div>
  );
}

export default App;
